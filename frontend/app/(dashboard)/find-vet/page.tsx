'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, MapPin, MessageSquare, Stethoscope } from 'lucide-react';
import { vetsApi, chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/hooks/useTranslation';
import { toast } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={cn('w-3.5 h-3.5',
          s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-obsidian-200')} />
      ))}
      <span className="text-xs text-obsidian-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
}

export default function FindVetPage() {
  const t = useT();
  const { user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [starting, setStarting] = useState<number | null>(null);

  const { data: vets = [], isLoading } = useQuery({
    queryKey: ['vets', search],
    queryFn: () => vetsApi.list(search || undefined).then((r) => r.data.results || r.data),
  });

  const handleContact = async (vetId: number) => {
    if (!user) { router.push('/login'); return; }
    if (user.subscription?.plan === 'basic' || user.subscription?.plan === 'standard') {
      toast.error('Chat with vets requires Premium plan. Upgrade to connect!');
      return;
    }
    setStarting(vetId);
    try {
      const res = await chatApi.startConversation(vetId);
      router.push(`/messages/${res.data.id}`);
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-obsidian-900">Find a Veterinarian</h1>
        <p className="text-obsidian-500 mt-1">Connect with trusted, approved veterinarians</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" />
        <input
          type="text"
          placeholder="Search by name, specialization, or clinic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-11"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-48 skeleton rounded-3xl" />)}
        </div>
      ) : vets.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="w-12 h-12 text-obsidian-300 mx-auto mb-4" />
          <p className="text-obsidian-500">No veterinarians found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vets.map((vet: any, i: number) => (
            <motion.div
              key={vet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="zoaria-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
                  {vet.profile_image
                    ? <img src={vet.profile_image} alt="" className="w-full h-full object-cover" />
                    : <span className="font-bold text-brand-700 text-xl">
                        {vet.name?.[0]?.toUpperCase() || 'V'}
                      </span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-obsidian-900 truncate">Dr. {vet.name}</h3>
                  {vet.specialization && (
                    <p className="text-xs text-brand-600 font-medium">{vet.specialization}</p>
                  )}
                  <StarRating rating={vet.rating} />
                </div>
              </div>

              {vet.clinic_name && (
                <div className="flex items-center gap-2 text-xs text-obsidian-500 mb-3">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{vet.clinic_name}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                {vet.consultation_price ? (
                  <span className="text-sm font-bold text-obsidian-900">
                    €{vet.consultation_price}
                    <span className="text-xs font-normal text-obsidian-400">/session</span>
                  </span>
                ) : (
                  <span className="text-xs text-obsidian-400">Price on request</span>
                )}
                <button
                  onClick={() => handleContact(vet.id)}
                  disabled={starting === vet.id}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {starting === vet.id ? 'Connecting...' : 'Chat'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
