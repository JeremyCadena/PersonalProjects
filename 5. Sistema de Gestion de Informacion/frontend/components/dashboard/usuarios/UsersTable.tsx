// ARCHIVO: /components/users/UsersTable.tsx
'use client';

import { Usuario, RolUsuario } from '@/lib/types';
import { UserButtons } from './UserButtons'; 
import { UserStatusBadge, UserRoleBadge } from './UserStatusBadge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { deleteUsuario, setUsuarioActiveStatus, getUsuarioById } from '@/lib/api'; 
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; 
import { EditUserForm } from './EditUserForm'; 

interface UsersTableProps {
  users: Usuario[];
  onRefresh: () => void; 
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onRefresh }) => {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  const currentRolUsuario = currentUser?.role || null;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = async (userId: number) => {
    if (!token) return;
    try {
      const userToEdit = await getUsuarioById(userId);
      setSelectedUser(userToEdit);
      setShowEditModal(true);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuario para edición.");
    }
  };


  const handleDeleteClick = async (userId: number) => {
    if (!token) return;
    try {
      const userToDelete = await getUsuarioById(userId);
      setSelectedUser(userToDelete);
      setShowDeleteModal(true);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuario para eliminación.");
    }
  };

  const confirmdeleteUsuario = async () => {
    if (!selectedUser || !token) return;
    setError(null);
    try {
      await deleteUsuario(selectedUser.user_id);
      onRefresh();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar usuario.");
    }
  };

  const handleToggleActiveStatus = async (userId: number, currentStatus: boolean) => {
    if (!token) return;
    setError(null);
    try {
      await setUsuarioActiveStatus(userId, !currentStatus);
      onRefresh(); 
    } catch (err: any) {
      setError(err.message || `Error al cambiar estado activo del usuario ${userId}.`);
    }
  };

  const handleFormSuccess = () => {
    onRefresh(); 
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowChangeRoleModal(false);
    setSelectedUser(null);
  };

  const canViewActions = currentRolUsuario === RolUsuario.ADMIN; 

  return (
    <div className="mt-6 flow-root">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-300 p-2 md:pt-0">
          <div className="md:hidden">
            {users.map((user) => (
              <div key={user.user_id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 text-lg font-medium">{user.nombres_apellidos}</div>
                    <p className="text-sm text-gray-500">{user.nickname }</p>
                  </div>
                  <UserRoleBadge role={user.role} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <UserStatusBadge status={user.is_active || false} />
                  </div>
                  {canViewActions && (
                    <UserButtons 
                                userId={user.user_id}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                onToggleActiveStatus={(id) => handleToggleActiveStatus(id, user.is_active || false)}
                                currentRolUsuario={currentRolUsuario} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">Nombre y Apellido</th>
                <th scope="col" className="px-3 py-5 font-medium">Nombre de Usuario</th>
                <th scope="col" className="px-3 py-5 font-medium">Rol</th>
                <th scope="col" className="px-3 py-5 font-medium">Estado</th>
                {canViewActions && (
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {users.map((user) => (
                <tr key={user.user_id} className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                  <td className="whitespace-nowrap px-3 py-3">{user.nombres_apellidos}</td>
                  <td className="whitespace-nowrap px-3 py-3">{user.nickname}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <UserRoleBadge role={user.role} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <UserStatusBadge status={user.is_active || false} />
                  </td>
                  {canViewActions && (
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <UserButtons
                                  userId={user.user_id}
                                  onEdit={handleEditClick}
                                  onDelete={handleDeleteClick}
                                  onToggleActiveStatus={(id) => handleToggleActiveStatus(id, user.is_active || false)}
                                  currentRolUsuario={currentRolUsuario}                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales para CRUD */}
      {showEditModal && selectedUser && (
        <EditUserForm
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {showDeleteModal && selectedUser && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar al usuario "${selectedUser.nombres_apellidos}"? Esta acción es irreversible.`}
          onConfirm={confirmdeleteUsuario}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};