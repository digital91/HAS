import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaDoorOpen, FaDoorClosed, FaCog } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import ThumbnailUpload from './ThumbnailUpload';
import './RoomManagement.css';

const RoomManagement = () => {
  const { socket } = useSocket();
  const { isAdmin, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Request rooms status when socket connects
    socket.emit('get-rooms-status');

    // Listen for room updates
    socket.on('room-status-update', (data) => {
      setRooms(prevRooms => 
        prevRooms.map(room => 
          (room._id || room.id) === data.roomId 
            ? { ...room, ...data.updates }
            : room
        )
      );
    });

    // Listen for initial rooms status
    socket.on('rooms-status', (roomsData) => {
      setRooms(roomsData);
      setLoading(false);
    });

    return () => {
      socket.off('room-status-update');
      socket.off('rooms-status');
    };
  }, [socket]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setLoading(false);
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'occupied':
        return '#FF9800';
      case 'maintenance':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRoomStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Có người xem';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Không xác định';
    }
  };

  const getRoomStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaDoorOpen />;
      case 'occupied':
        return <FaEye />;
      case 'maintenance':
        return <FaDoorClosed />;
      default:
        return <FaDoorOpen />;
    }
  };

  const handleRoomClick = (room) => {
    if (isAdmin()) {
      // Admin can open admin modal
      setSelectedRoom(room);
      setIsAdminModalOpen(true);
    } else if (room.status === 'available') {
      // Regular user can book available rooms
      setSelectedRoom(room);
      setIsBookingModalOpen(true);
    }
  };

  const handleThumbnailClick = (room, e) => {
    e.stopPropagation(); // Prevent room click
    if (isAdmin()) {
      setSelectedRoom(room);
      setIsThumbnailModalOpen(true);
    }
  };

  const handleBookRoom = async () => {
    if (!selectedRoom) return;

    try {
      const roomId = selectedRoom._id || selectedRoom.id;
      const response = await axios.post(`/api/rooms/${roomId}/book`);
      toast.success('Đặt phòng thành công!');
      setIsBookingModalOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error booking room:', error);
      toast.error('Đặt phòng thất bại');
    }
  };

  const handleAdminUpdate = async (roomId, updates) => {
    try {
      console.log('Updating room:', roomId, 'with updates:', updates);
      
      // Get token from AuthContext instead of localStorage
      const token = user?.token;
      if (!token) {
        toast.error('Bạn cần đăng nhập để thực hiện thao tác này');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const url = `/api/admin/${'rooms'}/${roomId}/status`;
      console.log('Request URL:', url);
      console.log('Request headers:', headers);
      
      const response = await axios.put(url, updates, { headers });
      console.log('Update successful:', response.data);
      toast.success('Cập nhật phòng thành công!');
      setIsAdminModalOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error updating room:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Optionally redirect to login or clear user data
      } else {
        toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleThumbnailUpdate = async (roomId, thumbnailUrl) => {
    try {
      // Get token from AuthContext instead of localStorage
      const token = user?.token;
      if (!token) {
        toast.error('Bạn cần đăng nhập để thực hiện thao tác này');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(`/api/rooms/${roomId}`, {
        thumbnailUrl: thumbnailUrl
      }, { headers });
      
      toast.success('Cập nhật thumbnail thành công!');
      setIsThumbnailModalOpen(false);
      setSelectedRoom(null);
      fetchRooms(); // Refresh rooms list
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error('Cập nhật thumbnail thất bại: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="room-management">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải thông tin phòng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-management">
      <div className="container">
        <div className="room-header">
          <h1>Quản lý phòng chiếu</h1>
          <p>Hiển thị trạng thái real-time của 9 phòng chiếu</p>
          {isAdmin() && (
            <div className="admin-notice">
              <FaCog className="admin-icon" />
              <span>Chế độ Admin: Click vào phòng để chỉnh sửa</span>
            </div>
          )}
        </div>

        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <motion.div
              key={room._id || room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`room-card ${room.status} ${isAdmin() || room.status === 'available' ? 'clickable' : ''}`}
              onClick={() => handleRoomClick(room)}
            >
              {/* Room Thumbnail */}
              {room.thumbnailUrl && (
                <div 
                  className={`room-thumbnail ${isAdmin() ? 'clickable' : ''}`}
                  onClick={(e) => handleThumbnailClick(room, e)}
                  title={isAdmin() ? 'Click để chỉnh sửa thumbnail' : ''}
                >
                  <img src={room.thumbnailUrl} alt={room.name} />
                  {isAdmin() && (
                    <div className="thumbnail-overlay">
                      <span>✏️ Chỉnh sửa</span>
                    </div>
                  )}
                </div>
              )}

              <div className="room-header">
                <h3>{room.name}</h3>
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getRoomStatusColor(room.status) }}
                >
                  {getRoomStatusIcon(room.status)}
                </div>
              </div>

              <div className="room-status">
                <span className="status-text">{getRoomStatusText(room.status)}</span>
              </div>

              {room.movie && (
                <div className="room-movie">
                  <h4>Phim đang hot:</h4>
                  <p>{room.movie.title}</p>
                </div>
              )}

              <div className="room-footer">
                <span className="last-activity">
                  Cập nhật: {new Date(room.lastActivity).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Room Booking Modal */}
        {isBookingModalOpen && selectedRoom && (
          <RoomBookingModal
            room={selectedRoom}
            onClose={() => setIsBookingModalOpen(false)}
            onBook={handleBookRoom}
          />
        )}

        {/* Admin Modal */}
        {isAdminModalOpen && selectedRoom && (
          <AdminRoomModal
            room={selectedRoom}
            onClose={() => setIsAdminModalOpen(false)}
            onUpdate={handleAdminUpdate}
          />
        )}

        {isThumbnailModalOpen && selectedRoom && (
          <ThumbnailModal
            room={selectedRoom}
            onClose={() => setIsThumbnailModalOpen(false)}
            onUpdate={handleThumbnailUpdate}
          />
        )}
      </div>
    </div>
  );
};

// Room Booking Modal Component
const RoomBookingModal = ({ room, onClose, onBook }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="booking-modal"
      >
        <div className="modal-header">
          <h2>Đặt phòng {room.name}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="room-info">
            <h3>{room.name}</h3>
            <p>Trạng thái: <span className="status-available">Trống</span></p>
            <p>Phòng này đang sẵn sàng để sử dụng.</p>
          </div>

          <div className="booking-info">
            <h4>Thông tin đặt phòng:</h4>
            <ul>
              <li>✓ Phòng riêng tư</li>
              <li>✓ Hệ thống âm thanh chất lượng cao</li>
              <li>✓ Màn hình lớn</li>
              <li>✓ Ghế ngồi thoải mái</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-outline">
            Hủy
          </button>
          <button onClick={onBook} className="btn btn-primary">
            Đặt phòng ngay
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Admin Room Modal Component
const AdminRoomModal = ({ room, onClose, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(room.status);

  const handleUpdate = () => {
    onUpdate(room._id || room.id, { status: selectedStatus });
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="admin-modal"
      >
        <div className="modal-header">
          <h2>Chỉnh sửa phòng {room.name}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label>Trạng thái phòng</label>
            <div className="status-options">
              <label className={`status-option ${selectedStatus === 'available' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={selectedStatus === 'available'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <FaDoorOpen />
                <span>Trống</span>
              </label>
              
              <label className={`status-option ${selectedStatus === 'occupied' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="occupied"
                  checked={selectedStatus === 'occupied'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <FaEye />
                <span>Có người xem</span>
              </label>
              
              <label className={`status-option ${selectedStatus === 'maintenance' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="maintenance"
                  checked={selectedStatus === 'maintenance'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <FaDoorClosed />
                <span>Bảo trì</span>
              </label>
            </div>
          </div>

          {room.movie && (
            <div className="current-movie">
              <h4>Phim hiện tại:</h4>
              <p><strong>{room.movie.title}</strong></p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-outline">
            Hủy
          </button>
          <button onClick={handleUpdate} className="btn btn-primary">
            Cập nhật
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Thumbnail Modal Component
const ThumbnailModal = ({ room, onClose, onUpdate }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(room.thumbnailUrl || '');

  const handleSave = () => {
    onUpdate(room._id || room.id, thumbnailUrl);
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="modal-content thumbnail-modal"
      >
        <div className="modal-header">
          <h2>Chỉnh sửa Thumbnail - {room.name}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <ThumbnailUpload
          currentThumbnail={room}
          onUrlChange={setThumbnailUrl}
          roomName={room.name}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-outline">
            Hủy
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Lưu Thumbnail
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomManagement;