import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
    persist(
        (set) => ({
            language: 'en',
            hasSelectedLanguage: false,
            setLanguage: (lang) => set({ language: lang, hasSelectedLanguage: true }),
        }),
        {
            name: 'jcll-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
