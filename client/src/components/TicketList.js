import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import { Ticket, Plus, Search, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketService.getTickets();
      setTickets(response.tickets);
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

  const getCategoryName = (category) => {
    switch (category) {
      case 1: return 'Hardware';
      case 2: return 'Software';
      case 3: return 'Network';
      case 4: return 'Other';
      default: return 'Unknown';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status.toString() === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority.toString() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Support Tickets</h1>
          <p className="text-secondary-600 mt-1 dark:text-secondary-300">Manage and track your IT support requests</p>
        </div>
        {user?.role !== 3 && (
          <Link to="/tickets/create" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Ticket</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="all">All Status</option>
              <option value="1">Open</option>
              <option value="2">In Progress</option>
              <option value="3">Resolved</option>
              <option value="4">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Urgent</option>
            </select>
          </div>

          <div className="text-sm text-secondary-600 flex items-center">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
      <div className="card text-center py-12">
          <Ticket className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2 dark:text-secondary-100">
            {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
          </h3>
        <p className="text-secondary-600 mb-4 dark:text-secondary-300">
            {tickets.length === 0 
              ? 'Create your first support ticket to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {tickets.length === 0 && user?.role !== 3 && (
            <Link to="/tickets/create" className="btn-primary">
              Create Your First Ticket
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket.status);
            const priorityInfo = getPriorityInfo(ticket.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={ticket.ticket_id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
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
                    
                    <p className="text-secondary-600 mb-3 line-clamp-2 dark:text-secondary-300">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
                      <div className="flex items-center space-x-4">
                        <span>#{ticket.ticket_id}</span>
                        <span>•</span>
                        <span>{getCategoryName(ticket.category)}</span>
                        <span>•</span>
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {ticket.assigned_to && (
                        <div className="text-right">
                          <span className="text-secondary-500 dark:text-secondary-400">Assigned to</span>
                          <div className="font-medium text-secondary-900 dark:text-secondary-100">
                            {ticket.assignee_first_name} {ticket.assignee_last_name}
                          </div>
                        </div>
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
  );
};

export default TicketList;
