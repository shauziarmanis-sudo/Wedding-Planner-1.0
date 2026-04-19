import { previewAdatSwitch } from '../actions/checklist.actions';
import { filterTasksByAdat } from '../lib/adat-registry';
import { MASTER_CHECKLIST } from '../lib/checklist-master-data';
import { ChecklistTask } from '../types/checklist.types';

// Mocking the getChecklist and other server action dependencies
jest.mock('../actions/checklist.actions', () => {
  const originalModule = jest.requireActual('../actions/checklist.actions');
  return {
    ...originalModule,
    getChecklist: jest.fn(),
  };
});

import { getChecklist } from '../actions/checklist.actions';

describe('Adat Switch Logic', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTask = (title: string, tags: any[], status: string = 'BELUM', is_custom: boolean = false): ChecklistTask => ({
    task_id: `ck_${Math.random()}`,
    phase_label: 'H-6 Bulan',
    days_before: 180,
    category: 'VENUE',
    title,
    description: '',
    adat_tags: tags,
    is_required: true,
    is_custom,
    status: status as any,
    completed_at: null,
    assignee: 'BERDUA',
    notes: '',
    added_by_adat_switch: false,
  });

  test('Scenario 1: Skenario Ganti Adat Biasa (Jawa -> Sunda)', async () => {
    // Current tasks (Jawa)
    const currentTasks = [
      mockTask('Task Universal', ['ALL']),
      mockTask('Siraman Jawa', ['JAWA']),
      mockTask('Midodareni', ['JAWA']),
    ];
    (getChecklist as jest.Mock).mockResolvedValue(currentTasks);

    const res = await previewAdatSwitch('SUNDA');
    expect(res.success).toBe(true);
    
    // Siraman Jawa and Midodareni should be removed
    expect(res.data?.tasks_removed.map(t => t.title)).toContain('Siraman Jawa');
    expect(res.data?.tasks_removed.map(t => t.title)).toContain('Midodareni');
    
    // Task Universal should be kept
    expect(res.data?.tasks_kept.map(t => t.title)).toContain('Task Universal');

    // New Sunda tasks should be added (like Ngeuyeuk Seureuh)
    expect(res.data?.tasks_added.some(t => t.title.includes('Ngeuyeuk Seureuh'))).toBe(true);
  });

  test('Scenario 2: Skenario Perlindungan Data (Task SELESAI)', async () => {
    const currentTasks = [
      mockTask('Siraman Jawa', ['JAWA'], 'SELESAI'), // This shouldn't be removed
      mockTask('Midodareni', ['JAWA'], 'BELUM'),     // This should be removed
    ];
    (getChecklist as jest.Mock).mockResolvedValue(currentTasks);

    const res = await previewAdatSwitch('SUNDA');
    expect(res.success).toBe(true);
    
    expect(res.data?.tasks_completed_kept.map(t => t.title)).toContain('Siraman Jawa');
    expect(res.data?.tasks_removed.map(t => t.title)).toContain('Midodareni');
  });

  test('Scenario 3: Skenario Custom Task (Tidak Terpengaruh)', async () => {
    const currentTasks = [
      mockTask('Sewa Sound System Sendiri', ['ALL'], 'BELUM', true),
    ];
    (getChecklist as jest.Mock).mockResolvedValue(currentTasks);

    const res = await previewAdatSwitch('SUNDA');
    expect(res.success).toBe(true);
    
    // Custom task must be kept
    expect(res.data?.tasks_kept.map(t => t.title)).toContain('Sewa Sound System Sendiri');
  });

  test('Scenario 4: Skenario Campuran (Jawa + Batak)', async () => {
    const currentTasks = [
      mockTask('Task Universal', ['ALL']),
      mockTask('Siraman Jawa', ['JAWA']),
    ];
    (getChecklist as jest.Mock).mockResolvedValue(currentTasks);

    const res = await previewAdatSwitch('JAWA', 'BATAK');
    expect(res.success).toBe(true);
    
    // Siraman Jawa should be kept
    expect(res.data?.tasks_kept.map(t => t.title)).toContain('Siraman Jawa');
    
    // Batak tasks should be added
    expect(res.data?.tasks_added.some(t => t.title.includes('Sinamot'))).toBe(true);
  });

  test('Scenario 5: Conflict Warning', async () => {
    const currentTasks = [
      mockTask('Task Universal', ['ALL']),
      mockTask('Siraman Jawa', ['JAWA'], 'PROSES'), // In progress, will be removed -> WARNING
    ];
    (getChecklist as jest.Mock).mockResolvedValue(currentTasks);

    const res = await previewAdatSwitch('BALI');
    expect(res.success).toBe(true);
    
    expect(res.data?.conflict_warnings.some(w => w.includes('PROSES'))).toBe(true);
    expect(res.data?.conflict_warnings.some(w => w.includes('Dewasa Ayu'))).toBe(true);
  });
});
