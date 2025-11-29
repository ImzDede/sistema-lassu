"use client"

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Inputs';
import Button from '@/components/Button';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [lookPassword, setLookPassword] = useState(false);

  const router = useRouter();

  // 2. FUNÇÃO DE LOGIN
  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Enviando dados:", { email, senha });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulando verificação (Apenas para teste)
      if (email === 'admin@teste.com' && senha === 'admin') {
        router.push('/home');
      } else {
        throw new Error('Matrícula ou senha incorretos.');
      }

    } catch (err) {
      setError('Falha ao entrar. Verifique seus dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setLookPassword(!lookPassword);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center md:flex-row md:justify-normal bg-white">

      {/* LADO ESQUERDO (Mantido igual) */}
      <div className="w-full md:w-1/2 bg-white md:bg-gray-200 flex flex-col items-center justify-center p-6 md:p-10 md:min-h-screen">
        <div className="mb-4 md:mb-8"> 
           <Image 
              src="/logo.svg"
              alt="Logo LSSSU"
              width={300}
              height={300} 
              priority
              className="w-40 md:w-56 lg:w-64 h-auto" 
           />
        </div>
      </div>

      {/* LADO DIREITO (Formulário) */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col gap-6">
          
          <h2 className="text-3xl md:text-4xl text-center mb-4 md:mb-8 text-black font-normal uppercase tracking-widest">Login</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            <Input 
              type="email" 
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="relative w-full">
              <Input 
                type={lookPassword ? "text" : "password"} 
                placeholder="SENHA" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
              >
                {lookPassword ? (
                  <EyeOff size={24} />
                ) : (
                  <Eye size={24} />
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-bold">{error}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="keep-connected" 
                className="w-5 h-5 border-2 border-gray-600 rounded-none accent-black cursor-pointer"
              />
              <label htmlFor="keep-connected" className="text-sm text-black cursor-pointer">
                manter conectado?
              </label>
            </div>

            <div className="mt-6">
               <Button type="submit" disabled={loading}>
                 {loading ? 'CARREGANDO...' : 'ENTRAR'}
               </Button>
            </div>
          </form>

          <div className="text-center">
            <a href="#" className="text-sm text-black hover:underline">
              esqueceu sua senha?
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}