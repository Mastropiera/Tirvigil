'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TrainingPair } from '@/types/report';

const STORAGE_KEY = 'trainingPairs';

export function useTrainingData() {
  const [pairs, setPairs] = useState<TrainingPair[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPairs(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando cambian los pares
  const savePairs = useCallback((newPairs: TrainingPair[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPairs));
    setPairs(newPairs);
  }, []);

  // Agregar nuevos pares
  const addPairs = useCallback((newPairs: TrainingPair[]) => {
    savePairs([...pairs, ...newPairs]);
  }, [pairs, savePairs]);

  // Actualizar un par especifico
  const updatePair = useCallback((id: string, updates: Partial<TrainingPair>) => {
    const updated = pairs.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    savePairs(updated);
  }, [pairs, savePairs]);

  // Eliminar un par
  const deletePair = useCallback((id: string) => {
    savePairs(pairs.filter(p => p.id !== id));
  }, [pairs, savePairs]);

  // Obtener estadisticas
  const getStats = useCallback(() => {
    return {
      total: pairs.length,
      pendientes: pairs.filter(p => p.status === 'pendiente').length,
      enProgreso: pairs.filter(p => p.status === 'en_progreso').length,
      completados: pairs.filter(p => p.status === 'completado' || p.status === 'revisado').length,
      totalMinutos: Math.round(pairs.reduce((acc, p) => acc + p.audioDuration, 0) / 60),
    };
  }, [pairs]);

  // Obtener pares pendientes
  const getPendingPairs = useCallback(() => {
    return pairs.filter(p => p.status === 'pendiente' || p.status === 'en_progreso');
  }, [pairs]);

  // Obtener pares completados
  const getCompletedPairs = useCallback(() => {
    return pairs.filter(p => p.status === 'completado' || p.status === 'revisado');
  }, [pairs]);

  // Limpiar completados
  const clearCompleted = useCallback(() => {
    savePairs(pairs.filter(p => p.status !== 'completado' && p.status !== 'revisado'));
  }, [pairs, savePairs]);

  return {
    pairs,
    isLoaded,
    addPairs,
    updatePair,
    deletePair,
    getStats,
    getPendingPairs,
    getCompletedPairs,
    clearCompleted,
  };
}
