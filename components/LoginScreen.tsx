import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isCreatingPin, setIsCreatingPin] = useState(false);
    const [confirmPin, setConfirmPin] = useState('');

    // Check if PIN exists
    const savedPin = localStorage.getItem('planner-hamilton-pin');
    const needsSetup = !savedPin;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (needsSetup || isCreatingPin) {
            // Creating new PIN
            if (pin.length < 4) {
                setError('O PIN deve ter pelo menos 4 dígitos');
                return;
            }

            if (!confirmPin) {
                setError('Por favor, confirme o PIN');
                return;
            }

            if (pin !== confirmPin) {
                setError('Os PINs não coincidem');
                return;
            }

            // Save PIN
            localStorage.setItem('planner-hamilton-pin', pin);
            onLogin();
        } else {
            // Validating existing PIN
            if (pin === savedPin) {
                onLogin();
            } else {
                setError('PIN incorreto');
                setPin('');
            }
        }
    };

    const handleResetPin = () => {
        setIsCreatingPin(true);
        setPin('');
        setConfirmPin('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Hamilton Planner</h1>
                    <p className="text-slate-500 text-sm mt-2">
                        {needsSetup || isCreatingPin ? 'Configure seu PIN de acesso' : 'Bem-vindo de volta'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* PIN Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {needsSetup || isCreatingPin ? 'Criar PIN' : 'PIN de Acesso'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-2xl tracking-widest"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Confirm PIN (only when creating) */}
                    {(needsSetup || isCreatingPin) && pin.length >= 4 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirmar PIN
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-2xl tracking-widest"
                                    placeholder="••••"
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        {needsSetup || isCreatingPin ? 'Configurar PIN' : 'Entrar'}
                    </button>

                    {/* Reset PIN Option */}
                    {!needsSetup && !isCreatingPin && (
                        <button
                            type="button"
                            onClick={handleResetPin}
                            className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
                        >
                            Esqueci meu PIN
                        </button>
                    )}
                </form>

                {/* Instructions */}
                {needsSetup && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800">
                            💡 <strong>Dica:</strong> Escolha um PIN de 4-6 dígitos que seja fácil de lembrar.
                            Você precisará dele sempre que abrir o planner.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
