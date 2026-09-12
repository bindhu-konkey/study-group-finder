import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MeetingModal = ({ isOpen, onClose, group, showToast }) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Meeting Form
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '4:00 PM - 5:30 PM',
    location: 'Campus Library Room 302',
    meetingLink: 'https://meet.google.com/',
    agenda: '',
  });

  const isCreator = user && group && group.creator?._id?.toString() === user._id?.toString();
  const isMember =
    user && group && (group.members || []).some((m) => (m._id || m).toString() === user._id?.toString());

  const fetchMeetings = async () => {
    if (!group?._id) return;
    setLoading(true);
    try {
      const res = await api.meetings.getByGroup(group._id);
      setMeetings(res.meetings || []);
    } catch (err) {
      showToast(err.message || 'Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && group?._id) {
      fetchMeetings();
      setShowAddForm(false);
    }
  }, [isOpen, group?._id]);

  if (!isOpen || !group) return null;

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      showToast('Title, date, and time are required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.meetings.create(group._id, formData);
      showToast('Study session scheduled successfully!', 'success');
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '4:00 PM - 5:30 PM',
        location: 'Campus Library Room 302',
        meetingLink: 'https://meet.google.com/',
        agenda: '',
      });
      setShowAddForm(false);
      fetchMeetings();
    } catch (err) {
      showToast(err.message || 'Failed to schedule meeting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled session?')) return;
    try {
      await api.meetings.delete(meetingId);
      showToast('Session removed from schedule.', 'info');
      setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
    } catch (err) {
      showToast(err.message || 'Failed to delete meeting.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white text-gray-900 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0056D6] border border-blue-200/80">
                {group.subject}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {group.members?.length || 0} / {group.memberLimit || group.maxMembers || 5} Members
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1.5">{group.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Study Sessions & Classroom Locations</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {(isCreator || isMember) && (
          <div className="py-3 flex justify-between items-center shrink-0">
            <span className="text-xs font-semibold text-gray-700">
              {meetings.length} Upcoming Session{meetings.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'View Schedule' : 'Schedule Session'}
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-2">
          {showAddForm ? (
            <form onSubmit={handleCreateMeeting} className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0056D6]" />
                Schedule Study Session
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Session Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Midterm Review & Problem Set 4"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6]"
                />
              </div>

              {/* Date, Start Time, End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0056D6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value, time: `${e.target.value} - ${formData.endTime || ''}` })}
                    placeholder="e.g. 4:30 PM"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value, time: `${formData.startTime || ''} - ${e.target.value}` })}
                    placeholder="e.g. 5:30 PM"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6]"
                  />
                </div>
              </div>

              {/* Meeting Type Toggle */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Meeting Type</label>
                <div className="flex gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="meetingType"
                      value="online"
                      checked={formData.meetingType === 'online'}
                      onChange={() => setFormData({ ...formData, meetingType: 'online' })}
                      className="accent-[#0056D6]"
                    />
                    <span>Online (Google Meet / Zoom)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="meetingType"
                      value="offline"
                      checked={formData.meetingType === 'offline'}
                      onChange={() => setFormData({ ...formData, meetingType: 'offline' })}
                      className="accent-[#0056D6]"
                    />
                    <span>In-Person (Campus Classroom / Lab)</span>
                  </label>
                </div>
              </div>

              {formData.meetingType === 'online' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Google Meet / Zoom Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Classroom / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Room B204 or Campus Library 3rd Floor"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Session Agenda (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="What topics or questions will we cover?"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0056D6] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          ) : loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading scheduled sessions...</div>
          ) : meetings.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-gray-50/70 border border-gray-200 p-6">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">No study sessions scheduled yet.</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {isCreator || isMember
                  ? 'Click "Schedule Session" above to set a date, classroom location, or video call link.'
                  : 'Join this study pod to see upcoming sessions and participate.'}
              </p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 shadow-sm transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{meeting.title}</h4>
                  {(isCreator || meeting.createdBy?.toString() === user?._id?.toString()) && (
                    <button
                      onClick={() => handleDeleteMeeting(meeting._id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                      title="Cancel session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0056D6] border border-blue-200/70 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#0056D6]" />
                    <span>{meeting.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/70 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{meeting.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{meeting.location}</span>
                  </div>
                </div>

                {meeting.agenda && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                    <strong className="text-gray-700">Agenda: </strong>
                    {meeting.agenda}
                  </p>
                )}

                {meeting.meetingLink && (
                  <div className="pt-1">
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video Call</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default MeetingModal;
