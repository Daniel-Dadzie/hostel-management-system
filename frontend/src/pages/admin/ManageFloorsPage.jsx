import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

function buildFloorRows(rooms) {
  const floorMap = new Map();

  for (const room of rooms) {
    if (room.hostelId == null || room.floorNumber == null) continue;

    const key = `${room.hostelId}-${room.floorNumber}`;
    if (!floorMap.has(key)) {
      floorMap.set(key, {
        key,
        hostelId: room.hostelId,
        hostelName: room.hostelName || 'Unknown Hostel',
        floorNumber: Number(room.floorNumber),
        roomCount: 0,
        totalCapacity: 0,
        currentOccupancy: 0,
        gender: room.roomGender || null
      });
    }

    const floor = floorMap.get(key);
    floor.roomCount += 1;
    floor.totalCapacity += Number(room.capacity || 0);
    floor.currentOccupancy += Number(room.currentOccupancy || 0);

    if (!floor.gender && room.roomGender) {
      floor.gender = room.roomGender;
    }
  }

  return Array.from(floorMap.values()).sort((a, b) => {
    if (a.hostelName !== b.hostelName) {
      return a.hostelName.localeCompare(b.hostelName);
    }
    return a.floorNumber - b.floorNumber;
  });
}

export default function ManageFloorsPage() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [roomsData, hostelsData] = await Promise.all([listRooms(), listHostels()]);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setHostels(Array.isArray(hostelsData) ? hostelsData : []);
      } catch (err) {
        setError(err.message || 'Failed to load floors');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const floors = useMemo(() => buildFloorRows(rooms), [rooms]);

  const filteredFloors = floors
    .filter((floor) => (selectedHostel === 'ALL' ? true : String(floor.hostelId) === selectedHostel))
    .filter((floor) => (selectedGender === 'ALL' ? true : floor.gender === selectedGender));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-neutral-900 dark:text-white">Manage Floors</h1>
          <p className="section-subtitle">View all floors by hostel and occupancy</p>
        </div>
        <Link to="/admin/rooms" className="btn-primary">
          Add Floor via Rooms
        </Link>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
        Floors are created from <span className="font-semibold">Manage Rooms</span>. Add a room with a new floor number to create that floor.
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="input-field"
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
          >
            <option value="ALL">Hostel: All</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={String(hostel.id)}>
                {hostel.name}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="ALL">Gender: All</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      {filteredFloors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">🏬</span>
          </div>
          <h3 className="empty-state-title">No Floors Found</h3>
          <p className="section-subtitle">Add rooms first to create floors in each hostel.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Hostel</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Floor</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Gender</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Rooms</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredFloors.map((floor) => (
                <tr key={floor.key}>
                  <td className="px-4 py-3">{floor.hostelName}</td>
                  <td className="px-4 py-3">Floor {floor.floorNumber}</td>
                  <td className="px-4 py-3">{floor.gender || 'N/A'}</td>
                  <td className="px-4 py-3">{floor.roomCount}</td>
                  <td className="px-4 py-3">{floor.currentOccupancy}/{floor.totalCapacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
