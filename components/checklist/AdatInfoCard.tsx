"use client";

import React, { useState } from 'react';
import { AdatType, ADAT_REGISTRY, getAdatColor } from '@/lib/adat-registry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdatInfoCardProps {
  adat: AdatType;
  secondaryAdat?: AdatType;
}

export function AdatInfoCard({ adat, secondaryAdat }: AdatInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const data = ADAT_REGISTRY[adat];
  const colors = getAdatColor(adat);

  if (!data) return null;

  return (
    <Card className="overflow-hidden shadow-sm" style={{ borderColor: colors.light }}>
      <CardHeader className="pb-3" style={{ backgroundColor: colors.light }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{data.emoji}</span>
              <CardTitle style={{ color: colors.main }}>{data.label}</CardTitle>
              {secondaryAdat && (
                <>
                  <span className="text-gray-400 mx-1">+</span>
                  <Badge variant="outline" className="bg-white/50">{ADAT_REGISTRY[secondaryAdat]?.label}</Badge>
                </>
              )}
            </div>
            <CardDescription className="text-gray-700">{data.region}</CardDescription>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            style={{ color: colors.main }}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-4">{data.deskripsi}</p>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {data.catatan && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 text-amber-800 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                  <p>{data.catatan}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Prosesi Khas:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.prosesi_khas.map(p => (
                    <Badge key={p} variant="secondary" className="bg-gray-100 text-gray-700 font-normal">{p}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Busana Khas:</h4>
                  <p className="text-sm text-gray-600">{data.busana_khas}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Vendor Khusus:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {data.vendor_khusus.map(v => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
