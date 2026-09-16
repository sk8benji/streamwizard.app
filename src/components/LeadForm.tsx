import React, { useState } from 'react';

export default function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    podcastName: '',
    useCase: 'Video Podcast Remoto',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      let res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formType: 'stream_wizard_access',
          submittedAt: new Date().toISOString()
        })
      });

      if (!res.ok) {
        res = await fetch('/send-email.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            formType: 'stream_wizard_access',
            submittedAt: new Date().toISOString()
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err: any) {
      try {
        const phpRes = await fetch('/send-email.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            formType: 'stream_wizard_access',
            submittedAt: new Date().toISOString()
          })
        });
        const phpData = await phpRes.json();
        if (phpRes.ok && phpData.success) {
          setStatus('success');
          return;
        }
      } catch (_) {}

      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-cyan-50/80 border border-cyan-200 text-center">
        <div className="w-16 h-16 bg-cyan-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-cyan-500/20">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud Recibida!</h3>
        <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed mb-6">
          Gracias, <strong>{formData.name}</strong>. Hemos recibido tus datos y te hemos enviado el acceso para comenzar a grabar en <strong>{formData.email}</strong>.
        </p>
        <a
          href="https://my.streamwizard.app"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gradient inline-flex items-center gap-2 py-3 px-6 text-sm font-bold"
        >
          <span>Ir a my.streamwizard.app</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Comienza a Grabar</h3>
        <p className="text-slate-500 text-sm">
          Prueba el estudio de Stream Wizard con grabación local por pistas separadas y transcripción con IA.
        </p>
      </div>

      {status === 'error' && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Alex Rivera"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Correo Electrónico *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="alex@podcast.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nombre del Podcast o Show
          </label>
          <input
            type="text"
            name="podcastName"
            value={formData.podcastName}
            onChange={handleChange}
            placeholder="El Podcast de Innovación"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Tipo de Formato
          </label>
          <select
            name="useCase"
            value={formData.useCase}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          >
            <option value="Video Podcast Remoto">Video Podcast Remoto</option>
            <option value="Podcast Solo Audio">Podcast Solo Audio (WAV)</option>
            <option value="Entrevistas de Investigación / Prensa">Entrevistas de Prensa / Medios</option>
            <option value="Agencia / Productora Audiovisual">Agencia / Productora</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          ¿Alguna consulta o requerimiento especial? (Opcional)
        </label>
        <textarea
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          placeholder="Cuéntanos con cuántos invitados sueles grabar o tu setup actual..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-gradient w-full py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <span>Enviando...</span>
        ) : (
          <>
            <span>Abrir Estudio en my.streamwizard.app</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </>
        )}
      </button>

      <div className="text-center mt-4 text-xs text-slate-400">
        🔒 Sin instalación para invitados &bull; Respaldo automático en la nube
      </div>
    </form>
  );
}
