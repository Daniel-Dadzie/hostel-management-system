import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyForHostel } from '../../services/studentService.js';
import { listHostels } from '../../services/hostelService.js';
import ApplyPreferencesForm from '../../components/student/ApplyPreferencesForm.jsx';
import ApplyResultCard from '../../components/student/ApplyResultCard.jsx';

const INITIAL_FORM = {
  hostelId: '',
  preferredCapacity: 2,
  hasAc: false,
  hasWifi: true,
  mattressType: 'NORMAL',
  specialRequests: ''
};

export default function ApplyHostelPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHostels();
  }, []);

  async function loadHostels() {
    try {
      const data = await listHostels();
      const activeHostels = Array.isArray(data) ? data.filter((h) => h.active) : [];
      setHostels(activeHostels);
      if (activeHostels.length > 0) {
        setForm((prev) => ({ ...prev, hostelId: String(activeHostels[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load hostels:', err);
    } finally {
      setLoadingHostels(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        hostelId: form.hostelId ? Number(form.hostelId) : null,
        preferredCapacity: Number(form.preferredCapacity)
      };
      const data = await applyForHostel(payload);
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
      hostels={hostels}
      loading={loading || loadingHostels}
      error={error}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
