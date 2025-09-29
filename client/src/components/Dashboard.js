import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { Ticket, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketService.getTickets();
      setTickets(response.tickets.slice(0, 5)); // Show only recent 5 tickets
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
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

  const getRoleName = (role) => {
    switch (role) {
      case 1: return 'Student';
      case 2: return 'Teacher';
      case 3: return 'IT Coordinator';
      default: return 'User';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.firstName || user?.first_name}!
            </h1>
            <p className="text-secondary-600 mt-1">
              {getRoleName(user?.role)} Dashboard
            </p>
          </div>
          {user?.role !== 3 && (
            <Link to="/tickets/create" className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>New Ticket</span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ticket className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Tickets</p>
              <p className="text-2xl font-bold text-secondary-900">{tickets.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Resolved</p>
              <p className="text-2xl font-bold text-secondary-900">
                {tickets.filter(t => t.status === 3 || t.status === 4).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">In Progress</p>
              <p className="text-2xl font-bold text-secondary-900">
                {tickets.filter(t => t.status === 2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No tickets yet</h3>
            <p className="text-secondary-600 mb-4">Create your first support ticket to get started.</p>
            <Link to="/tickets/create" className="btn-primary">
              Create Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const statusInfo = getStatusInfo(ticket.status);
              const priorityInfo = getPriorityInfo(ticket.priority);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={ticket.ticket_id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-secondary-900">
                          <Link 
                            to={`/tickets/${ticket.ticket_id}`}
                            className="hover:text-primary-600"
                          >
                            {ticket.title}
                          </Link>
                        </h3>
                        <span className={`status-badge ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                        <span className={`priority-badge ${priorityInfo.color}`}>
                          {priorityInfo.text}
                        </span>
                      </div>
                      <p className="text-secondary-600 text-sm mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center text-xs text-secondary-500">
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        {ticket.assigned_to && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Assigned to {ticket.assignee_first_name} {ticket.assignee_last_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
