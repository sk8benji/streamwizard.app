import React, { useState } from 'react';

export default function SupportTicketForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Grabación de Estudio & Multitrack',
    ticketPriority: 'Estándar',
    phone: '',
    message: ''
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
          formType: 'support_ticket',
          submittedAt: new Date().toISOString()
        })
      });

      if (!res.ok) {
        res = await fetch('/send-email.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            formType: 'support_ticket',
            submittedAt: new Date().toISOString()
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'No se pudo enviar el ticket de soporte. Por favor, intenta de nuevo.');
      }
    } catch (err: any) {
      try {
        const phpRes = await fetch('/send-email.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            formType: 'support_ticket',
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
      setErrorMessage(err.message || 'Ocurrió un error inesperado al enviar la solicitud.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50/90 border border-emerald-200 text-center">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-emerald-500/20">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Ticket de Soporte Enviado!</h3>
        <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed mb-6">
          Tu ticket ha sido enviado al equipo técnico de Stream Wizard en <strong>info@streamwizard.app</strong>. Revisaremos tu solicitud y te responderemos a <strong>{formData.email}</strong>.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
        >
          Enviar otro ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Enviar Ticket de Soporte</h3>
        <p className="text-slate-500 text-sm">
          Canal prioritario directo con el equipo técnico y de ingeniería de Stream Wizard.
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
            placeholder="Carlos Mendoza"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Correo de tu Cuenta *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="carlos@podcast.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Tema de la Consulta *
          </label>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          >
            <option value="Grabación de Estudio & Multitrack">Grabación de Estudio & Multitrack</option>
            <option value="Calidad de Audio WAV / Video 4K">Calidad de Audio WAV / Video 4K</option>
            <option value="Transcripción Automática con IA">Transcripción Automática con IA</option>
            <option value="Subida a la Nube & Sincronización">Subida a la Nube & Sincronización</option>
            <option value="Invitados & Conexión Web">Invitados & Acceso Web sin Descargas</option>
            <option value="Facturación & Planes">Planes y Facturación</option>
            <option value="Consulta Técnica General">Consulta Técnica General</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nivel de Prioridad
          </label>
          <select
            name="ticketPriority"
            value={formData.ticketPriority}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
          >
            <option value="Estándar">Estándar (Respuesta en 24h)</option>
            <option value="Urgente">Urgente (Grabación en vivo en curso)</option>
            <option value="Facturación">Cuenta / Facturación</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Teléfono o Enlace de tu Estudio (Opcional)
        </label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+34 600 000 000 o streamwizard.app/studio/..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Descripción Detallada del Problema *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Por favor describe qué está ocurriendo, navegador utilizado, enlace de la sesión o cualquier detalle relevante..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-cyan-600 transition-all outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-gradient w-full py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <span>Enviando Ticket...</span>
        ) : (
          <>
            <span>Enviar Ticket de Soporte</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </>
        )}
      </button>

      <div className="text-center mt-4 text-xs text-slate-400">
        Revisión directa del equipo técnico &bull; Enviado automáticamente a info@streamwizard.app
      </div>
    </form>
  );
}
