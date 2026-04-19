import React from 'react';
import { AdatType, ADAT_REGISTRY, getAdatColor } from '@/lib/adat-registry';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Edit2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdatBadgeProps {
  adatTags: AdatType[] | ['ALL'];
  isCustom?: boolean;
  addedBySwitch?: boolean;
  compact?: boolean;
}

export function AdatBadge({ adatTags, isCustom, addedBySwitch, compact = false }: AdatBadgeProps) {
  if (adatTags.includes('ALL' as any)) {
    if (isCustom) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 gap-1 whitespace-nowrap">
          <Edit2 className="w-3 h-3" />
          {!compact && "Kustom"}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 whitespace-nowrap">
        {!compact && "Semua Adat"}
      </Badge>
    );
  }

  // Handle specific adat tags
  return (
    <div className="flex flex-wrap gap-1">
      {adatTags.map((tag) => {
        const adat = ADAT_REGISTRY[tag as AdatType];
        if (!adat) return null;
        
        const colors = getAdatColor(tag as AdatType);
        
        return (
          <Badge 
            key={tag} 
            variant="outline" 
            className="gap-1 whitespace-nowrap border-transparent font-medium"
            style={{ 
              backgroundColor: colors.light, 
              color: colors.main 
            }}
          >
            <span>{adat.emoji}</span>
            {!compact && <span>{adat.label}</span>}
          </Badge>
        );
      })}
      
      {addedBySwitch && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-1.5 cursor-help">
                <RefreshCw className="w-3 h-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Ditambahkan saat ganti adat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
