import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { updateService } from '../services/updateService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  MessageSquare,
  Send,
  Edit
} from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [statusDraft, setStatusDraft] = useState(null);

  useEffect(() => {
    fetchTicketDetails();
    fetchUpdates();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await ticketService.getTicket(id);
      setTicket(response.ticket);
      setStatusDraft(response.ticket?.status ?? null);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const response = await updateService.getUpdates(id);
      setUpdates(response.updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    setSubmittingUpdate(true);
    try {
      await updateService.addUpdate(id, newUpdate);
      setNewUpdate('');
      fetchUpdates();
      toast.success('Update added successfully');
    } catch (error) {
      toast.error('Failed to add update');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 1: return { text: 'Open', color: 'status-open', icon: Clock };
      case 2: return { text: 'In Progress', color: 'status-in-progress', icon: Clock };
      case 3: return { text: 'Resolved', color: 'status-resolved', icon: CheckCircle };
      case 4: return { text: 'Closed', color: 'status-closed', icon: CheckCircle };
      default: return { text: 'Unknown', color: 'status-closed', icon: AlertCircle };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 1: return { text: 'Low', color: 'priority-low' };
      case 2: return { text: 'Medium', color: 'priority-medium' };
      case 3: return { text: 'High', color: 'priority-high' };
      case 4: return { text: 'Urgent', color: 'priority-urgent' };
      default: return { text: 'Unknown', color: 'priority-low' };
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 1: return 'Hardware';
      case 2: return 'Software';
      case 3: return 'Network';
      case 4: return 'Other';
      default: return 'Unknown';
    }
  };

  const handleAssignToMe = async () => {
    if (!user || user.role !== 3) return;
    setSavingTicket(true);
    try {
      await ticketService.updateTicket(id, { assignedTo: user.userId });
      await fetchTicketDetails();
      toast.success('Ticket assigned to you');
    } catch (error) {
      toast.error('Failed to assign ticket');
    } finally {
      setSavingTicket(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!user || user.role !== 3) return;
    if (statusDraft == null) return;
    setSavingTicket(true);
    try {
      await ticketService.updateTicket(id, { status: Number(statusDraft) });
      await fetchTicketDetails();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSavingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4 dark:text-secondary-100">Ticket Not Found</h1>
        <p className="text-secondary-600 mb-4 dark:text-secondary-300">The ticket you're looking for doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate('/tickets')} className="btn-primary">
          Back to Tickets
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 dark:text-secondary-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          {user?.userId === ticket.created_by && (
            <button
              onClick={async () => {
                if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
                try {
                  await ticketService.deleteTicket(id);
                  toast.success('Ticket deleted');
                  navigate('/tickets');
                } catch (error) {
                  toast.error('Failed to delete ticket');
                }
              }}
              className="btn-secondary"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className={`status-badge ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.text}
          </span>
          <span className={`priority-badge ${priorityInfo.color}`}>
            {priorityInfo.text}
          </span>
          {user?.role === 3 && (
            <>
              <select
                value={statusDraft ?? ticket.status}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="input-field h-8 py-0 px-2"
              >
                <option value={1}>Open</option>
                <option value={2}>In Progress</option>
                <option value={3}>Resolved</option>
                <option value={4}>Closed</option>
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={savingTicket}
                className="btn-primary h-8 py-0"
              >
                {savingTicket ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{ticket.title}</h1>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">#{ticket.ticket_id}</span>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-secondary-700 whitespace-pre-wrap dark:text-secondary-300">{ticket.description}</p>
            </div>
          </div>

          {/* Updates */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center dark:text-secondary-100">
              <MessageSquare className="h-5 w-5 mr-2" />
              Updates ({updates.length})
            </h2>

            {updates.length === 0 ? (
              <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                <p>No updates yet. Be the first to add a comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.update_id} className="border-l-4 border-primary-200 pl-4 py-2 dark:border-primary-300/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-secondary-500 dark:text-secondary-400" />
                        <span className="font-medium text-secondary-900 dark:text-secondary-100">
                          {update.first_name} {update.last_name}
                        </span>
                      </div>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-secondary-700 whitespace-pre-wrap dark:text-secondary-300">{update.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Update Form */}
            <form onSubmit={handleAddUpdate} className="mt-6 pt-6 border-t border-secondary-200">
              <div className="space-y-4">
                <div>
              <label htmlFor="update" className="block text-sm font-medium text-secondary-700 mb-2 dark:text-secondary-300">
                    Add Update
                  </label>
                  <textarea
                    id="update"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add a comment or update about this ticket..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingUpdate || !newUpdate.trim()}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submittingUpdate ? 'Adding...' : 'Add Update'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 dark:text-secondary-100">Ticket Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-600 dark:text-secondary-300">Category</label>
                <p className="text-secondary-900 dark:text-secondary-100">{getCategoryName(ticket.category)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-600 dark:text-secondary-300">Priority</label>
                <span className={`priority-badge ${priorityInfo.color}`}>
                  {priorityInfo.text}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-600 dark:text-secondary-300">Status</label>
                <span className={`status-badge ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.text}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-600 dark:text-secondary-300">Created</label>
                <p className="text-secondary-900 flex items-center dark:text-secondary-100">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                <div>
                  <label className="block text-sm font-medium text-secondary-600 dark:text-secondary-300">Last Updated</label>
                  <p className="text-secondary-900 flex items-center dark:text-secondary-100">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(ticket.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* People */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">People</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-600">Created by</label>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4 text-secondary-500" />
                  <span className="text-secondary-900">
                    {ticket.creator_first_name} {ticket.creator_last_name}
                  </span>
                </div>
              </div>
              
              {ticket.assigned_to ? (
                <div>
                  <label className="block text-sm font-medium text-secondary-600">Assigned to</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-secondary-500" />
                    <span className="text-secondary-900">
                      {ticket.assignee_first_name} {ticket.assignee_last_name}
                    </span>
                  </div>
                </div>
              ) : (
                user?.role === 3 && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-600">Assigned to</label>
                    <div className="flex items-center mt-1">
                      <button
                        onClick={handleAssignToMe}
                        disabled={savingTicket}
                        className="btn-primary"
                      >
                        {savingTicket ? 'Assigning...' : 'Assign to me'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
