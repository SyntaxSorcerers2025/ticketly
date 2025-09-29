import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { 
  Users, 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  UserCheck,
  Settings
} from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ticketStats, userStatsData, ticketsData, usersData] = await Promise.all([
        ticketService.getTicketStats(),
        userService.getUserStats(),
        ticketService.getTickets(),
        userService.getUsers()
      ]);

      setStats(ticketStats.stats);
      setUserStats(userStatsData.stats);
      setTickets(ticketsData.tickets.slice(0, 10)); // Show recent 10 tickets
      setUsers(usersData.users.slice(0, 10)); // Show recent 10 users
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      default: return { text: 'Unknown', color: 'status-closed', icon: AlertTriangle };
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

  const getRoleColor = (role) => {
    switch (role) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600 mt-1">Manage tickets, users, and system overview</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-200 text-secondary-700 hover:bg-secondary-300'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-secondary-900">{stats.total_tickets || 0}</p>
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
                  <p className="text-2xl font-bold text-secondary-900">{stats.resolved_tickets || 0}</p>
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
                  <p className="text-2xl font-bold text-secondary-900">{stats.in_progress_tickets || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Urgent</p>
                  <p className="text-2xl font-bold text-secondary-900">{stats.urgent_tickets || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Total Users</p>
                  <p className="text-2xl font-bold text-secondary-900">{userStats.total_users || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Teachers</p>
                  <p className="text-2xl font-bold text-secondary-900">{userStats.teachers || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">Students</p>
                  <p className="text-2xl font-bold text-secondary-900">{userStats.students || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-secondary-500 text-center py-4">No tickets found</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const priorityInfo = getPriorityInfo(ticket.priority);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={ticket.ticket_id} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-secondary-900">#{ticket.ticket_id}</span>
                          <span className="text-secondary-600">{ticket.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-secondary-500">
                          <span>by {ticket.creator_first_name} {ticket.creator_last_name}</span>
                          <span>•</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`status-badge ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </span>
                        <span className={`priority-badge ${priorityInfo.color}`}>
                          {priorityInfo.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">All Tickets</h3>
          {tickets.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No tickets found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {tickets.map((ticket) => {
                    const statusInfo = getStatusInfo(ticket.status);
                    const priorityInfo = getPriorityInfo(ticket.priority);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={ticket.ticket_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              #{ticket.ticket_id} - {ticket.title}
                            </div>
                            <div className="text-sm text-secondary-500 truncate max-w-xs">
                              {ticket.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`priority-badge ${priorityInfo.color}`}>
                            {priorityInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {ticket.creator_first_name} {ticket.creator_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">All Users</h3>
          {users.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${getRoleColor(user.role)}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
