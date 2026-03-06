'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, PawPrint } from 'lucide-react';
import { petsApi } from '@/lib/api';
import { useT } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const AVATARS: Record<string, string> = {
  dog: '🐕', cat: '🐈', horse: '🐎', rabbit: '🐇',
  guinea: '🐹', bird: '🦜', fish: '🐠', turtle: '🐢',
};

const statusStyle = {
  healthy:     'bg-green-50 text-green-700 border-green-200',
  overweight:  'bg-amber-50 text-amber-700 border-amber-200',
  underweight: 'bg-red-50 text-red-700 border-red-200',
};

export default function PetsPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsApi.list().then((r) => r.data.results || r.data),
  });

  const pets = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-obsidian-900">{t('pets.title')}</h1>
          <p className="text-obsidian-500 mt-1">{pets.length} pet{pets.length !== 1 ? 's' : ''} in your care</p>
        </div>
        <Link href="/pets/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('pets.addNew')}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-48 skeleton rounded-3xl" />)}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-4">🐾</div>
          <h2 className="font-display text-2xl font-bold text-obsidian-900 mb-2">{t('pets.noPets')}</h2>
          <p className="text-obsidian-500 mb-6">{t('pets.noPetsText')}</p>
          <Link href="/pets/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('pets.addNew')}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet: any, i: number) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/pets/${pet.id}`} className="zoaria-card block group hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center text-4xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {pet.photo_url
                      ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      : AVATARS[pet.avatar_type] || '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-obsidian-900 text-lg truncate">{pet.name}</h3>
                    <p className="text-obsidian-500 text-sm">{pet.species_name}</p>
                    {pet.breed_name && <p className="text-obsidian-400 text-xs">{pet.breed_name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {pet.age && (
                    <div className="bg-sage-50 rounded-xl p-2.5">
                      <p className="text-obsidian-400 text-xs">Age</p>
                      <p className="font-semibold text-obsidian-800">{pet.age}mo</p>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="bg-sage-50 rounded-xl p-2.5">
                      <p className="text-obsidian-400 text-xs">Weight</p>
                      <p className="font-semibold text-obsidian-800">{pet.weight}kg</p>
                    </div>
                  )}
                </div>
                {pet.weight_status && (
                  <div className={cn('badge border mt-3 capitalize', statusStyle[pet.weight_status as keyof typeof statusStyle])}>
                    {pet.weight_status}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}

          {/* Add pet card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pets.length * 0.06 }}
          >
            <Link href="/pets/new"
              className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-sage-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-sage-500 group-hover:text-brand-600" />
              </div>
              <p className="text-sm font-semibold text-obsidian-500 group-hover:text-brand-700 transition-colors">
                {t('pets.addNew')}
              </p>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
