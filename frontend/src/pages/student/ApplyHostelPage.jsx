import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client.js';
import ApplyPreferencesForm from '../../components/student/ApplyPreferencesForm.jsx';
import ApplyResultCard from '../../components/student/ApplyResultCard.jsx';

const INITIAL_FORM = {
  hasAc: false,
  hasWifi: true,
  mattressType: 'NORMAL',
  specialRequests: ''
};

export default function ApplyHostelPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/student/apply', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <ApplyResultCard
        result={result}
        onViewBooking={() => navigate('/student/booking')}
        onApplyAgain={() => setResult(null)}
      />
    );
  }

  return (
    <ApplyPreferencesForm
      form={form}
      loading={loading}
      error={error}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
