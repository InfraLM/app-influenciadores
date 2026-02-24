// Cliente da API do backend próprio (Express + PostgreSQL)
// Emula a interface do Supabase (.from, .auth, .rpc) mas chama o backend local/Vercel
import { api } from '@/lib/api';

export { api };