import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaSearch, FaSync } from 'react-icons/fa';
import {
  bulkCheckoutStudents,
  bulkClearRetainStudents,
  bulkPromoteStudents,
  bulkRetainStudents,
  getRolloverContext,
  listRolloverStudents,
  runAnnualRollover
} from '../../services/bookingService.js';

const ACTION_HANDLERS = {
  retain: bulkRetainStudents,
  'clear-retain': bulkClearRetainStudents,
  promote: bulkPromoteStudents,
  checkout: bulkCheckoutStudents
};

export default function LifecycleManagementPanel({ onLifecycleChanged }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rolloverContext, setRolloverContext] = useState(null);
  const [rolloverStudents, setRolloverStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void loadLifecycleData();
  }, []);

  async function loadLifecycleData() {
    setLoading(true);
    try {
      const [context, students] = await Promise.all([getRolloverContext(), listRolloverStudents()]);
      setRolloverContext(context || null);
      setRolloverStudents(Array.isArray(students) ? students : []);
      setSelectedStudentIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function toggleStudentSelection(studentId) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rolloverStudents.filter(
      (student) =>
        !query
        || student.fullName?.toLowerCase().includes(query)
        || student.email?.toLowerCase().includes(query)
        || String(student.studentId).includes(query)
    );
  }, [rolloverStudents, search]);

  const allFilteredSelected =
    filteredStudents.length > 0
    && filteredStudents.every((student) => selectedStudentIds.includes(student.studentId));

  async function runBulkAction(action) {
    if (selectedStudentIds.length === 0) {
      return;
    }

    const actionHandler = ACTION_HANDLERS[action];
    if (!actionHandler) {
      return;
    }

    setActionLoading(true);
    try {
      await actionHandler(selectedStudentIds);
      await loadLifecycleData();
      if (onLifecycleChanged) {
        await onLifecycleChanged();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  async function runScheduledCheckout() {
    setActionLoading(true);
    try {
      await runAnnualRollover();
      await loadLifecycleData();
      if (onLifecycleChanged) {
        await onLifecycleChanged();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
              <FaCalendarAlt className="text-sm" />
              Academic Lifecycle
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Active term: {rolloverContext ? `${rolloverContext.academicYear} • Semester ${rolloverContext.semester}` : 'Not configured'}
            </p>
          </div>
          <button
            type="button"
            onClick={runScheduledCheckout}
            disabled={actionLoading}
            className="btn-primary text-sm disabled:opacity-50"
          >
            <FaSync className={actionLoading ? 'animate-spin' : ''} />
            Run Semester Checkout
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Term Window</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
              {rolloverContext?.startDate ?? '—'} to {rolloverContext?.endDate ?? '—'}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Reapplication Opens</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">{rolloverContext?.reapplicationOpenDate ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Portal Status</p>
            <p className={`mt-1 text-sm font-semibold ${rolloverContext?.reapplicationWindowOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {rolloverContext?.reapplicationWindowOpen ? 'Open for applications' : 'Closed until window opens'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Student Lifecycle Actions</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
            <input
              type="text"
              className="input-field py-1.5 pl-8 pr-3 text-sm"
              placeholder="Search by name, email, or ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runBulkAction('retain')}
            disabled={selectedStudentIds.length === 0 || actionLoading}
            className="rounded-full bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-800 hover:bg-yellow-200 disabled:opacity-50 dark:bg-yellow-900/20 dark:text-yellow-300"
          >
            Retain Selected
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('clear-retain')}
            disabled={selectedStudentIds.length === 0 || actionLoading}
            className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Clear Retain
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('promote')}
            disabled={selectedStudentIds.length === 0 || actionLoading}
            className="rounded-full bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-300"
          >
            Promote Selected
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('checkout')}
            disabled={selectedStudentIds.length === 0 || actionLoading}
            className="rounded-full bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-300"
          >
            Force Checkout
          </button>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{selectedStudentIds.length} selected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                <th className="pb-2 pr-4">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedStudentIds(filteredStudents.map((student) => student.studentId));
                        return;
                      }
                      setSelectedStudentIds([]);
                    }}
                  />
                </th>
                <th className="pb-2 pr-4">Student</th>
                <th className="pb-2 pr-4">Level</th>
                <th className="pb-2 pr-4">Booking</th>
                <th className="pb-2 pr-4">Academic Year</th>
                <th className="pb-2 pr-4">Semester</th>
                <th className="pb-2">Retain Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-neutral-500">
                    No students found for lifecycle operations.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.studentId)}
                        onChange={() => toggleStudentSelection(student.studentId)}
                      />
                    </td>
                    <td className="py-2.5 pr-4">
                      <p className="font-semibold text-neutral-900 dark:text-white">{student.fullName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{student.email}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-neutral-700 dark:text-neutral-300">{student.currentLevel}</td>
                    <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">
                      {student.hasActiveBooking ? `${student.hostelName ?? '—'} · ${student.roomNumber ?? '—'}` : 'No active booking'}
                    </td>
                    <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">{student.bookingAcademicYear ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">{student.bookingAcademicSession ?? '—'}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${student.retainedFromCheckout ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                        {student.retainedFromCheckout ? 'Retained' : 'Not Retained'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

LifecycleManagementPanel.propTypes = {
  onLifecycleChanged: PropTypes.func
};
