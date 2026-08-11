/* eslint-disable @typescript-eslint/no-explicit-any */
// app/trips/page.tsx


"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Trip, CreateTripRequest, EditableTrip } from "@/trip_types";

export default function Home() {
  type NewTrip = { name: string; legs: { city: string; startDate: string; endDate: string; note: string; attractions: any[] }[]; hotels: any[]; };
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTrip, setNewTrip] = useState<NewTrip>({ name: "", legs: [{ city: "", startDate: "", endDate: "", note: "", attractions: [] }], hotels: [] });
  const [editedTrip, setEditedTrip] = useState<EditableTrip | null>(null);
  
  // Single active state to handle which trip is currently targeted by modals
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [invitedUser, setInvitedUser] = useState("");
  const [userToRemove, setUserToRemove] = useState("");
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const addUserModalRef = useRef<HTMLDivElement>(null);
  const removeUserModalRef = useRef<HTMLDivElement>(null);
  const leaveModalRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLeg = () => setNewTrip({ ...newTrip, legs: [...newTrip.legs, { city: "", startDate: "", endDate: "", note: "", attractions: []}] });
  const updateLeg = (index: number, field: "city" | "startDate" | "endDate" | "note", value: string) => {
    const updatedLegs = [...newTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setNewTrip({ ...newTrip, legs: updatedLegs });
  };
  const removeLeg = (index: number) => setNewTrip({ ...newTrip, legs: newTrip.legs.filter((_, i) => i !== index) });

  const fetchTrips = useCallback(async () => {
    try {
      const response = await fetch("/api/trips");
      if (response.status === 401) { router.push("/login"); return; }
      
      // Prevent JSON parsing errors if the backend crashes
      if (!response.ok) throw new Error("Server returned an error"); 
      
      const data = await response.json();
      setTrips(data);
    } catch (error) { 
      console.error(error); 
      showToast("Failed to load trips from server.", "error");
    }
  }, [router]);

  const updateEditedLeg = (index: number, field: "city" | "startDate" | "endDate", value: string) => {
    if (!editedTrip) return;
    const updatedLegs = [...editedTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setEditedTrip({ ...editedTrip, legs: updatedLegs });
  };

  const handleTripSubmit = async (newTrip: CreateTripRequest): Promise<boolean> => {
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTrip) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to create trip.");
      
      await fetchTrips();
      showToast("Trip created successfully!", "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
      fetchTrips();
    };
    load();
  }, [fetchTrips]);

  const handleEditTripSubmit = async (editedTrip: EditableTrip): Promise<boolean> => {
    try {
      const { _id, name, legs } = editedTrip;
      const response = await fetch(`/api/trips/${_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, legs }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to edit trip.");
      
      await fetchTrips();
      showToast("Trip updated successfully!", "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  const handleDeleteTrip = async (deleteTripId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/trips/${deleteTripId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete trip.");
      }
      
      await fetchTrips();
      showToast("Trip permanently deleted.", "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  const handleAddUser = async (tripId: string, username: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user_settings/${tripId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to invite user.");
      
      await fetchTrips();
      showToast(`Successfully added ${username} to the trip!`, "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  const handleRemoveUser = async (tripId: string, username: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user_settings/${tripId}`, { 
        method: "DELETE", // Assuming DELETE handles both leaving and removing based on body
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ username }) 
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to remove user.");
      
      await fetchTrips();
      showToast(`Successfully removed ${username}.`, "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  const handleDeleteCurrentUser = async (tripId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user_settings/${tripId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to leave trip.");
      }
      
      await fetchTrips();
      showToast("You have left the trip.", "success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(message, "error");
      return false;
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  // Form submit wrappers
  const onAddSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    const success = await handleTripSubmit(newTrip); 
    if (success) { resetNewTrip(); closeModal(createModalRef); }
  };
  
  const onEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!editedTrip) return; 
    const success = await handleEditTripSubmit(editedTrip); 
    if (success) { closeModal(editModalRef); }
  };
  
  const onDeleteSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!activeTrip) return;
    const success = await handleDeleteTrip(activeTrip._id); 
    if (success) { closeModal(deleteModalRef); setActiveTrip(null); }
  };

  const onAddUserSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!activeTrip) return;
    const success = await handleAddUser(activeTrip._id, invitedUser); 
    if (success) { closeModal(addUserModalRef); setInvitedUser(""); setActiveTrip(null); }
  };

  const onRemoveUserSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!activeTrip || !userToRemove) return;
    const success = await handleRemoveUser(activeTrip._id, userToRemove); 
    if (success) { closeModal(removeUserModalRef); setUserToRemove(""); setActiveTrip(null); }
  };

  const onLeaveSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (!activeTrip) return;
    const success = await handleDeleteCurrentUser(activeTrip._id); 
    if (success) { closeModal(leaveModalRef); setActiveTrip(null); }
  };

  const onLogoutSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    await handleLogout(); 
  };

  const addEditedLeg = () => { if (!editedTrip) return; setEditedTrip({ ...editedTrip, legs: [...editedTrip.legs, { city: "", startDate: "", endDate: "", note: "", attractions: []}] }); };
  const removeEditedLeg = (index: number) => { if (!editedTrip) return; setEditedTrip({ ...editedTrip, legs: editedTrip.legs.filter((_, i) => i !== index) }); };

  const closeModal = async (modalRef: React.RefObject<HTMLDivElement | null>) => {
    const bootstrap = await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
    if (modalRef.current) {
      const modal = bootstrap.Modal.getInstance(modalRef.current) || new bootstrap.Modal(modalRef.current);
      modal.hide();
    }
  };

  const resetNewTrip = () => setNewTrip({ name: "", legs: [{ city: "", startDate: "", endDate: "", note: "", attractions: [] }], hotels: [] });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      
      {/* Global Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-9999 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-xl font-bold flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider">✈️ TripSync</h1>
        <button type="button" className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors" data-bs-toggle="modal" data-bs-target="#logoutModal">
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8 grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Trips</h2>
          <button type="button" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors" data-bs-toggle="modal" data-bs-target="#createModal">
            + Create New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trips.length > 0 ? (
            trips.map((trip: Trip) => {
              const members = (trip.usernames && trip.usernames.length > 0) ? trip.usernames : (trip.userIds && trip.userIds.length > 0 ? trip.userIds : []);
              const owner = members.length > 0 ? members[0] : null;
              const invitedMembers = members.slice(1);

              return (
                <div key={trip._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
                  {/* Card Header (Now uses Trip Name) */}
                  <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg truncate pr-4">{trip.name || "Untitled Trip"}</h3>
                    <a href={`/trips/${trip._id}`} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold transition-colors border border-white/20 whitespace-nowrap">
                      Open →
                    </a>
                  </div>
                  
                  {/* Card Body - Legs Table */}
                  <div className="p-0 overflow-x-auto grow">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 tracking-wider">City</th>
                          <th className="px-6 py-3 tracking-wider">Start Date</th>
                          <th className="px-6 py-3 tracking-wider">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trip.legs.map((leg, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-bold text-slate-700">{leg.city}</td>
                            <td className="px-6 py-3 font-medium">{leg.startDate}</td>
                            <td className="px-6 py-3 font-medium">{leg.endDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card Footer - Members Section */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Roster:</span>
                      {owner && (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-bold shadow-sm border border-purple-200 flex items-center">
                          👑 {owner}
                        </span>
                      )}
                      {invitedMembers.map((member, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium shadow-sm border border-blue-200">
                          {member}
                        </span>
                      ))}
                      {members.length === 0 && <span className="text-xs text-gray-400 italic">No members</span>}
                    </div>
                  </div>

                  {/* Card Action Bar */}
                  <div className="px-6 py-3 bg-white border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                    <button 
                      onClick={() => setEditedTrip({ _id: trip._id, name: trip.name, legs: trip.legs, hotels: trip.hotels })}
                      data-bs-toggle="modal" data-bs-target="#editModal"
                      className="text-xs font-bold px-3 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => setActiveTrip(trip)}
                      data-bs-toggle="modal" data-bs-target="#inviteModal"
                      className="text-xs font-bold px-3 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                      ➕ Invite
                    </button>
                    <button 
                      onClick={() => setActiveTrip(trip)}
                      data-bs-toggle="modal" data-bs-target="#removeUserModal"
                      className="text-xs font-bold px-3 py-1.5 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      ➖ Remove
                    </button>
                    <button 
                      onClick={() => setActiveTrip(trip)}
                      data-bs-toggle="modal" data-bs-target="#leaveModal"
                      className="text-xs font-bold px-3 py-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      🚪 Leave
                    </button>
                    <button 
                      onClick={() => setActiveTrip(trip)}
                      data-bs-toggle="modal" data-bs-target="#deleteModal"
                      className="text-xs font-bold px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-5xl mb-4 opacity-50">🏖️</div>
              <p className="text-xl font-bold text-slate-700">No trips found</p>
              <p className="text-sm mt-2 font-medium">Click &apos;+ Create New Trip&apos; to start planning your next adventure!</p>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* CREATE MODAL */}
      <div className="modal fade" id="createModal" tabIndex={-1} ref={createModalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onAddSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-slate-800">Create New Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Trip Name</label>
                  <input type="text" className="form-control font-bold" placeholder="e.g. Summer Getaway" value={newTrip.name} onChange={(e) => setNewTrip({...newTrip, name: e.target.value})} required />
                </div>
                {newTrip.legs.map((leg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    <h6 className="font-bold text-slate-600 mb-3 text-sm uppercase tracking-wider">Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-3" placeholder="Destination City" value={leg.city} onChange={(e) => updateLeg(index, "city", e.target.value)} required />
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                            <input type="date" className="form-control" value={leg.startDate} onChange={(e) => updateLeg(index, "startDate", e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                            <input type="date" className="form-control" value={leg.endDate} onChange={(e) => updateLeg(index, "endDate", e.target.value)} required />
                        </div>
                    </div>
                    {/* NEW: Note field added here */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Trip Notes</label>
                        <textarea className="form-control text-sm" rows={2} placeholder="Optional notes for this leg..." value={leg.note} onChange={(e) => updateLeg(index, "note", e.target.value)}></textarea>
                    </div>
                    {newTrip.legs.length > 1 && ( <button type="button" className="btn btn-sm btn-outline-danger mt-3" onClick={() => removeLeg(index)}>Remove Leg</button> )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline-secondary w-full border-dashed font-bold" onClick={addLeg}>+ Add Another Destination</button>
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-primary w-full font-bold py-2">Save Trip</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <div className="modal fade" id="editModal" tabIndex={-1} ref={editModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onEditSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-slate-800">Edit {editedTrip?.name || "Trip"}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                {editedTrip && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm font-bold text-slate-700 mb-1 block">Trip Name</label>
                      <input type="text" className="form-control font-bold" value={editedTrip.name} onChange={(e) => setEditedTrip({...editedTrip, name: e.target.value})} required />
                    </div>
                    {editedTrip.legs.map((leg, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <h6 className="font-bold text-slate-600 mb-3 text-sm uppercase tracking-wider">Leg {index + 1}</h6>
                        <input type="text" className="form-control mb-3" value={leg.city} onChange={(e) => updateEditedLeg(index, "city", e.target.value)} required />
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="date" className="form-control" value={leg.startDate} onChange={(e) => updateEditedLeg(index, "startDate", e.target.value)} required />
                            <input type="date" className="form-control" value={leg.endDate} onChange={(e) => updateEditedLeg(index, "endDate", e.target.value)} required />
                        </div>
                        <div className="flex space-x-2 mt-2">
                            <button type="button" className="btn btn-sm btn-outline-danger flex-1 font-bold" onClick={() => removeEditedLeg(index)}>Remove</button>
                            <button type="button" className="btn btn-sm btn-outline-secondary flex-1 font-bold" onClick={addEditedLeg}>+ Add</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-primary w-full font-bold py-2" disabled={!editedTrip}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* INVITE MODAL */}
      <div className="modal fade" id="inviteModal" tabIndex={-1} ref={addUserModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onAddUserSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-green-700">Invite User</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <p className="text-sm text-gray-600 mb-4">Invite a registered user to <strong>{activeTrip?.name}</strong>.</p>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Participant Username</label>
                    <input type="text" className="form-control" placeholder="Enter exactly as registered" value={invitedUser} onChange={(e) => setInvitedUser(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-success w-full font-bold">Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* REMOVE USER MODAL (NEW) */}
      <div className="modal fade" id="removeUserModal" tabIndex={-1} ref={removeUserModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onRemoveUserSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-orange-700">Remove User</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <p className="text-sm text-gray-600 mb-4">Select a user to remove from <strong>{activeTrip?.name}</strong>.</p>
                <select className="form-control mb-4" onChange={(e) => setUserToRemove(e.target.value)} value={userToRemove} required>
                  <option value="" disabled>-- Select a Member --</option>
                  {/* Extract usernames from active trip, filtering out undefined/null */}
                  {(activeTrip?.usernames?.length ? activeTrip.usernames : (activeTrip?.userIds || [])).map((user, idx) => (
                    <option key={idx} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-warning text-orange-950 w-full font-bold" disabled={!userToRemove}>Remove User</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LEAVE MODAL */}
      <div className="modal fade" id="leaveModal" tabIndex={-1} ref={leaveModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onLeaveSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-slate-800">Leave Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body text-center py-6">
                <p className="text-lg mb-2">Are you sure you want to leave <strong>{activeTrip?.name}</strong>?</p>
                <p className="text-sm text-gray-500">You will lose access to the itinerary immediately.</p>
              </div>
              <div className="modal-footer bg-gray-50 flex gap-2">
                <button type="button" className="btn btn-light flex-1 font-bold border border-gray-300" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-secondary flex-1 font-bold">Leave Trip</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <div className="modal fade" id="deleteModal" tabIndex={-1} ref={deleteModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onDeleteSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-red-600 font-bold">Delete Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body text-center py-6">
                <p className="text-lg mb-2 text-slate-800">Delete <strong>{activeTrip?.name}</strong> forever?</p>
                <p className="text-sm text-red-600 font-medium">This action cannot be undone and will remove the trip for all users.</p>
              </div>
              <div className="modal-footer bg-gray-50 flex gap-2">
                <button type="button" className="btn btn-light flex-1 font-bold border border-gray-300" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-danger flex-1 font-bold">Delete Permanently</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <div className="modal fade" id="logoutModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-sm">
          <div className="modal-content p-4">
            <form onSubmit={onLogoutSubmit}>
              <div className="text-center mb-4">
                <h5 className="text-xl font-bold text-slate-800">Ready to leave?</h5>
                <p className="text-gray-500 text-sm mt-2">You will need your TOTP code to log back in.</p>
              </div>
              <div className="flex space-x-3">
                 <button type="button" className="btn btn-light flex-1 font-medium border border-gray-300" data-bs-dismiss="modal">Cancel</button>
                 <button type="submit" className="btn btn-danger flex-1 font-bold" data-bs-dismiss="modal">Logout</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}