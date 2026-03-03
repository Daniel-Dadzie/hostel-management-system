import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyForHostel } from '../../services/studentService.js';
import { listStudentHostelRooms, listStudentHostels } from '../../services/hostelService.js';
import ApplyPreferencesForm from '../../components/student/ApplyPreferencesForm.jsx';
import ApplyResultCard from '../../components/student/ApplyResultCard.jsx';

const INITIAL_FORM = {
  hostelId: '',
  floorNumber: '',
  roomId: '',
  hasAc: false,
  hasWifi: true,
  mattressType: 'NORMAL',
  specialRequests: ''
};

export default function ApplyHostelPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramHostelId = searchParams.get('hostelId') || '';
  const paramFloorNumber = searchParams.get('floorNumber') || '';
  const paramRoomId = searchParams.get('roomId') || '';

  useEffect(() => {
    loadHostels(paramHostelId, paramFloorNumber, paramRoomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHostels(overrideHostelId, overrideFloorNumber, overrideRoomId) {
    try {
      const data = await listStudentHostels();
      const activeHostels = Array.isArray(data) ? data : [];
      setHostels(activeHostels);
      if (activeHostels.length > 0) {
        const targetId = overrideHostelId || String(activeHostels[0].id);
        setForm((prev) => ({ ...prev, hostelId: targetId }));
        await loadRooms(targetId, overrideFloorNumber, overrideRoomId);
      }
    } catch (err) {
      console.error('Failed to load hostels:', err);
      setError(err.message || 'Failed to load hostels');
    } finally {
      setLoadingHostels(false);
    }
  }

  async function loadRooms(hostelId, overrideFloorNumber, overrideRoomId) {
    if (!hostelId) {
      setRooms([]);
      setFloors([]);
      setForm((prev) => ({ ...prev, floorNumber: '', roomId: '' }));
      return;
    }

    setLoadingRooms(true);
    try {
      const data = await listStudentHostelRooms(Number(hostelId));
      const availableRooms = Array.isArray(data) ? data : [];
      setRooms(availableRooms);

      const uniqueFloors = [...new Set(availableRooms.map((room) => room.floorNumber))]
        .filter((floorNumber) => floorNumber != null)
        .sort((floorA, floorB) => floorA - floorB);

      setFloors(uniqueFloors);

      if (availableRooms.length > 0) {
        const floorToUse = overrideFloorNumber ? Number(overrideFloorNumber) : uniqueFloors[0];
        const roomToUse = overrideRoomId
          ? (availableRooms.find((r) => String(r.id) === String(overrideRoomId)) || availableRooms[0])
          : (availableRooms.find((r) => r.floorNumber === floorToUse) || availableRooms[0]);
        setForm((prev) => ({
          ...prev,
          floorNumber: floorToUse == null ? '' : String(floorToUse),
          roomId: String(roomToUse.id),
          hasAc: Boolean(roomToUse.hasAc),
          hasWifi: Boolean(roomToUse.hasWifi),
          mattressType: roomToUse.mattressType || 'NORMAL'
        }));
      } else {
        setForm((prev) => ({ ...prev, floorNumber: '', roomId: '' }));
      }
    } catch (err) {
      setRooms([]);
      setFloors([]);
      setForm((prev) => ({ ...prev, floorNumber: '', roomId: '' }));
      setError(err.message || 'Failed to load rooms for selected hostel');
    } finally {
      setLoadingRooms(false);
    }
  }

  function handleChange(field, value) {
    if (field === 'hostelId') {
      setForm((prev) => ({ ...prev, hostelId: value, floorNumber: '', roomId: '' }));
      loadRooms(value);
      return;
    }

    if (field === 'floorNumber') {
      const selectedFloor = Number(value);
      const floorRooms = rooms.filter((room) => room.floorNumber === selectedFloor);

      if (floorRooms.length > 0) {
        const firstRoom = floorRooms[0];
        setForm((prev) => ({
          ...prev,
          floorNumber: value,
          roomId: String(firstRoom.id),
          hasAc: Boolean(firstRoom.hasAc),
          hasWifi: Boolean(firstRoom.hasWifi),
          mattressType: firstRoom.mattressType || 'NORMAL'
        }));
      } else {
        setForm((prev) => ({ ...prev, floorNumber: value, roomId: '' }));
      }
      return;
    }

    if (field === 'roomId') {
      const selectedRoom = rooms.find((room) => String(room.id) === String(value));
      if (selectedRoom) {
        setForm((prev) => ({
          ...prev,
          roomId: String(selectedRoom.id),
          hasAc: Boolean(selectedRoom.hasAc),
          hasWifi: Boolean(selectedRoom.hasWifi),
          mattressType: selectedRoom.mattressType || 'NORMAL'
        }));
      } else {
        setForm((prev) => ({ ...prev, roomId: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        hasAc: form.hasAc,
        hasWifi: form.hasWifi,
        mattressType: form.mattressType,
        specialRequests: form.specialRequests,
        hostelId: form.hostelId ? Number(form.hostelId) : null,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : null,
        roomId: form.roomId ? Number(form.roomId) : null
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

  const selectedFloorNumber = form.floorNumber ? Number(form.floorNumber) : null;
  const floorFilteredRooms =
    selectedFloorNumber == null
      ? []
      : rooms.filter((room) => room.floorNumber === selectedFloorNumber);

  return (
    <ApplyPreferencesForm
      form={form}
      hostels={hostels}
      floors={floors}
      rooms={floorFilteredRooms}
      loading={loading || loadingHostels || loadingRooms}
      error={error}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
