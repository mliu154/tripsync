"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Trip, CreateTripRequest, EditableTrip } from "@/trip_types";

export default function Home() {
  type NewTrip = {
    legs: { city: string; startDate: string; endDate: string; }[];
  };
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTrip, setNewTrip] = useState<NewTrip>({ legs: [{ city: "", startDate: "", endDate: "" }] });
  const [editedTrip, setEditedTrip] = useState<EditableTrip | null>(null);
  const [editedUser, setEditedUser] = useState("");
  const [deletePreviewTrip, setDeletePreviewTrip] = useState<Trip | null>(null);
  const [addUserPreviewTrip, setAddUserPreviewTrip] = useState<Trip | null>(null);
  const [deleteCurrentUserPreviewTrip, setDeleteCurrentUserPreviewTrip] = useState<Trip | null>(null);
  
  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const addUserModalRef = useRef<HTMLDivElement>(null);
  const deleteCurrentUserModalRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const [editTripId, setEditTripId] = useState("");
  const [deleteTripId, setDeleteTripId] = useState("");
  const [addUserTripId, setAddUserTripId] = useState("");
  const [deleteCurrentUserTripId, setDeleteCurrentUserTripId] = useState("");

  const addLeg = () => setNewTrip({ ...newTrip, legs: [...newTrip.legs, { city: "", startDate: "", endDate: "" }] });
  const updateLeg = (index: number, field: "city" | "startDate" | "endDate", value: string) => {
    const updatedLegs = [...newTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setNewTrip({ ...newTrip, legs: updatedLegs });
  };
  const removeLeg = (index: number) => {
    setNewTrip({ ...newTrip, legs: newTrip.legs.filter((_, i) => i !== index) });
  };

  const fetchTrips = useCallback(async () => {
    try {
      const response = await fetch("/api/trips");
      if (response.status === 401) { router.push("/login"); return; }
      const data = await response.json();
      setTrips(data);
    } catch (error) { console.error(error); }
  }, [router]);

  const updateEditedLeg = (index: number, field: "city" | "startDate" | "endDate", value: string) => {
    if (!editedTrip) return;
    const updatedLegs = [...editedTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setEditedTrip({ ...editedTrip, legs: updatedLegs });
  };

  const handleTripSubmit = async (e: React.FormEvent<HTMLFormElement>, newTrip: CreateTripRequest, fetchTrips: () => Promise<void>) => {
    e.preventDefault();
    await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTrip) });
    await fetchTrips();
  };

  useEffect(() => {
    const load = async () => {
      await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
      fetchTrips();
    };
    load();
  }, [fetchTrips]);

  const handleEditTripSubmit = async (e: React.FormEvent<HTMLFormElement>, editedTrip: EditableTrip, fetchTrips: () => Promise<void>) => {
    e.preventDefault();
    const { _id, legs } = editedTrip;
    await fetch(`/api/trips/${_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ legs }) });
    await fetchTrips();
  };

  const handleDeleteTrip = async (deleteTripId: string, fetchTrips: () => Promise<void>) => {
    if (!deleteTripId) return;
    await fetch(`/api/trips/${deleteTripId}`, { method: "DELETE" });
    await fetchTrips();
  };

  const handleAddUser = async (addUserTripId: string, username: string, fetchTrips: () => Promise<void>) => {
    if (!addUserTripId) return;
    await fetch(`/api/user_settings/${addUserTripId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    await fetchTrips();
  };

  const handleDeleteCurrentUser = async (deleteCurrentUserTripId: string, fetchTrips: () => Promise<void>) => {
    if (!deleteCurrentUserTripId) return;
    await fetch(`/api/user_settings/${deleteCurrentUserTripId}`, { method: "DELETE" });
    await fetchTrips();
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  const onAddSubmit = (e: React.FormEvent<HTMLFormElement>) => { handleTripSubmit(e, newTrip, fetchTrips); resetNewTrip(); closeModal(createModalRef); };
  const onEditSubmit = (e: React.FormEvent<HTMLFormElement>) => { if (!editedTrip) return; handleEditTripSubmit(e, editedTrip, fetchTrips); closeModal(editModalRef); };
  
  const onEditSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setEditTripId(id);
    const trip = trips.find((t) => t._id === id);
    if (trip) setEditedTrip({ _id: trip._id, legs: trip.legs });
  };
  
  const addEditedLeg = () => { if (!editedTrip) return; setEditedTrip({ ...editedTrip, legs: [...editedTrip.legs, { city: "", startDate: "", endDate: "" }] }); };
  const removeEditedLeg = (index: number) => { if (!editedTrip) return; setEditedTrip({ ...editedTrip, legs: editedTrip.legs.filter((_, i) => i !== index) }); };
  
  const onDeleteSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleDeleteTrip(deleteTripId, fetchTrips); closeModal(deleteModalRef); };
  const onDeleteSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value; setDeleteTripId(id);
    const trip = trips.find((t) => t._id === id);
    setDeletePreviewTrip(trip ? trip : null);
  };
  
  const onAddUserSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value; setAddUserTripId(id);
    const trip = trips.find((t) => t._id === id);
    setAddUserPreviewTrip(trip ? trip : null);
  };
  
  const onDeleteCurrentUserSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value; setDeleteCurrentUserTripId(id);
    const trip = trips.find((t) => t._id === id);
    setDeleteCurrentUserPreviewTrip(trip ? trip : null);
  };

  const onAddUserSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleAddUser(addUserTripId, editedUser, fetchTrips); closeModal(addUserModalRef); };
  const onDeleteCurrentUserSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleDeleteCurrentUser(deleteCurrentUserTripId, fetchTrips); closeModal(deleteCurrentUserModalRef); };
  const onLogoutSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleLogout(); };

  const closeModal = async (modalRef: React.RefObject<HTMLDivElement | null>) => {
    const bootstrap = await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
    if (modalRef.current) {
      const modal = bootstrap.Modal.getInstance(modalRef.current) || new bootstrap.Modal(modalRef.current);
      modal.hide();
    }
  };

  const resetNewTrip = () => setNewTrip({ legs: [{ city: "", startDate: "", endDate: "" }] });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider">✈️ TripSync</h1>
        <button type="button" className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors" data-bs-toggle="modal" data-bs-target="#logoutModal">
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8 grow w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-slate-800">My Trips</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 shadow-sm transition-colors" data-bs-toggle="modal" data-bs-target="#inputModal0">+ Create Trip</button>
            <button type="button" className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md font-medium hover:bg-slate-300 shadow-sm transition-colors" data-bs-toggle="modal" data-bs-target="#inputModal1">Edit Trip</button>
            <button type="button" className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-medium hover:bg-green-200 shadow-sm transition-colors" data-bs-toggle="modal" data-bs-target="#inputModal3">Invite User</button>
            <button type="button" className="bg-orange-100 text-orange-800 px-4 py-2 rounded-md font-medium hover:bg-orange-200 shadow-sm transition-colors" data-bs-toggle="modal" data-bs-target="#inputModal4">Leave Trip</button>
            <button type="button" className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-200 shadow-sm transition-colors" data-bs-toggle="modal" data-bs-target="#inputModal2">Delete Trip</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.length > 0 ? (
            trips.map((trip: Trip) => {
              // Graceful fallback to userIds if usernames aren't populated yet
              const members = (trip.usernames && trip.usernames.length > 0) 
                ? trip.usernames 
                : (trip.userIds && trip.userIds.length > 0 ? trip.userIds : []);
                
              const owner = members.length > 0 ? members[0] : null;
              const invitedMembers = members.slice(1);

              return (
                <div key={trip._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="bg-slate-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-mono text-xs font-medium text-gray-500">Trip ID: {trip._id}</span>
                    <a href={`/trips/${trip._id}`} className="text-blue-600 text-xs font-bold hover:underline">
                      View Details →
                    </a>
                  </div>
                  
                  <div className="p-0 overflow-x-auto grow">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-xs tracking-wider">City</th>
                          <th className="px-6 py-3 text-xs tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-xs tracking-wider">End Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trip.legs.map((leg, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-bold text-slate-800">{leg.city}</td>
                            <td className="px-6 py-3">{leg.startDate}</td>
                            <td className="px-6 py-3">{leg.endDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Roster:</span>
                      
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

                      {members.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No members assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">🏖️</div>
              <p className="text-lg font-medium text-slate-700">No trips found</p>
              <p className="text-sm mt-1">Click &apos;+ Create Trip&apos; to start planning your next adventure!</p>
            </div>
          )}
        </div>
      </main>

      {/* --- ALL BOOTSTRAP MODALS --- */}
      <div className="modal fade" id="inputModal0" tabIndex={-1} ref={createModalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onAddSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-slate-800">Create New Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                {newTrip.legs.map((leg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    <h6 className="font-bold text-slate-700 mb-3">Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-3" placeholder="Destination City" value={leg.city} onChange={(e) => updateLeg(index, "city", e.target.value)} required />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
                            <input type="date" className="form-control" value={leg.startDate} onChange={(e) => updateLeg(index, "startDate", e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date</label>
                            <input type="date" className="form-control" value={leg.endDate} onChange={(e) => updateLeg(index, "endDate", e.target.value)} required />
                        </div>
                    </div>
                    {newTrip.legs.length > 1 && ( <button type="button" className="btn btn-sm btn-outline-danger mt-3" onClick={() => removeLeg(index)}>Remove Leg</button> )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline-secondary w-full border-dashed" onClick={addLeg}>+ Add Another Destination</button>
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-primary w-full font-bold">Save Trip</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="inputModal1" tabIndex={-1} ref={editModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onEditSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-slate-800">Edit Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-4" onChange={onEditSelectChange} value={editTripId}>
                  <option value="">-- Select a Trip to Edit --</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!editedTrip && <p className="text-gray-500 text-center py-4 italic">Select a trip above to begin editing.</p>}
                {editedTrip?.legs.map((leg, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                    <h6 className="font-bold text-slate-700 mb-3">Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-3" value={leg.city} onChange={(e) => updateEditedLeg(index, "city", e.target.value)} />
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="date" className="form-control" value={leg.startDate} onChange={(e) => updateEditedLeg(index, "startDate", e.target.value)} />
                        <input type="date" className="form-control" value={leg.endDate} onChange={(e) => updateEditedLeg(index, "endDate", e.target.value)} />
                    </div>
                    <div className="flex space-x-2 mt-2">
                        <button type="button" className="btn btn-sm btn-outline-danger flex-1" onClick={() => removeEditedLeg(index)}>Remove</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary flex-1" onClick={addEditedLeg}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-primary w-full font-bold" disabled={!editedTrip}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="inputModal2" tabIndex={-1} ref={deleteModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onDeleteSubmit}>
              <div className="modal-header">
                <h5 className="modal-title text-red-600 font-bold">Delete Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-4" onChange={onDeleteSelectChange} value={deleteTripId}>
                  <option value="">-- Select a Trip to Delete --</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!deletePreviewTrip && <p className="text-gray-500 text-center py-4 italic">Select a trip above to preview.</p>}
                {deletePreviewTrip?.legs.map((leg, index) => (
                  <div key={index} className="border border-red-100 rounded-lg p-3 mb-3 bg-red-50/30 opacity-70">
                    <h6 className="text-red-800 font-medium text-sm">Leg {index + 1}: {leg.city}</h6>
                  </div>
                ))}
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-danger w-full font-bold" disabled={!deletePreviewTrip}>Delete Trip Permanently</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="inputModal3" tabIndex={-1} ref={addUserModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onAddUserSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-green-700">Invite User to Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-4" onChange={onAddUserSelectChange} value={addUserTripId}>
                  <option value="">-- Select a Trip --</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!addUserPreviewTrip && <p className="text-gray-500 text-center py-4 italic">Select a trip to invite users.</p>}
                {addUserPreviewTrip && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Participant Username</label>
                        <input type="text" className="form-control" placeholder="Enter exactly as registered" value={editedUser} onChange={(e) => setEditedUser(e.target.value)} required />
                    </div>
                )}
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-success w-full font-bold" disabled={!addUserPreviewTrip}>Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="inputModal4" tabIndex={-1} ref={deleteCurrentUserModalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onDeleteCurrentUserSubmit}>
              <div className="modal-header">
                <h5 className="modal-title font-bold text-orange-600">Leave Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-4" onChange={onDeleteCurrentUserSelectChange} value={deleteCurrentUserTripId}>
                  <option value="">-- Select a Trip --</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!deleteCurrentUserPreviewTrip && (<p className="text-gray-500 text-center py-4 italic">Select a trip to leave.</p>)}
                {deleteCurrentUserPreviewTrip?.legs.map((leg, index) => (
                  <div key={index} className="border border-orange-200 rounded-lg p-3 mb-3 bg-orange-50 opacity-80">
                     <h6 className="text-orange-800 font-medium text-sm">Leg {index + 1}: {leg.city}</h6>
                  </div>
                ))}
              </div>
              <div className="modal-footer bg-gray-50">
                <button type="submit" className="btn btn-warning w-full font-bold text-orange-950" disabled={!deleteCurrentUserPreviewTrip}>Remove Me From This Trip</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="logoutModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-sm">
          <div className="modal-content p-4">
            <form onSubmit={onLogoutSubmit}>
              <div className="text-center mb-4">
                <h5 className="text-xl font-bold text-slate-800">Ready to leave?</h5>
                <p className="text-gray-500 text-sm mt-2">You will need your TOTP code to log back in.</p>
              </div>
              <div className="flex space-x-3">
                 <button type="button" className="btn btn-light flex-1 font-medium" data-bs-dismiss="modal">Cancel</button>
                 <button type="submit" className="btn btn-danger flex-1 font-bold" data-bs-dismiss="modal">Logout</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}