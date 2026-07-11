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
      if (response.status === 401) { 
        router.push("/login"); 
        return; 
      }
      const data = await response.json();
      setTrips(data);
    } catch (error) { 
      console.error(error); 
    }
  }, [router]);

  const updateEditedLeg = (index: number, field: "city" | "startDate" | "endDate", value: string) => {
    if (!editedTrip) return;
    const updatedLegs = [...editedTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setEditedTrip({ ...editedTrip, legs: updatedLegs });
  };
  
  const updateDeletedLeg = (index: number, field: "city" | "startDate" | "endDate", value: string) => {
    if (!deletePreviewTrip) return;
    const updatedLegs = [...deletePreviewTrip.legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setDeletePreviewTrip({ ...deletePreviewTrip, legs: updatedLegs });
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Tailwind Navigation Bar */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider">✈️ TripSync</h1>
        <button type="button" className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors" data-bs-toggle="modal" data-bs-target="#logoutModal">
          Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-slate-800">My Trips</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 shadow-sm" data-bs-toggle="modal" data-bs-target="#inputModal0">Create Trip</button>
            <button type="button" className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md font-medium hover:bg-slate-300 shadow-sm" data-bs-toggle="modal" data-bs-target="#inputModal1">Edit Trip</button>
            <button type="button" className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-200 shadow-sm" data-bs-toggle="modal" data-bs-target="#inputModal2">Delete Trip</button>
            <button type="button" className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-medium hover:bg-green-200 shadow-sm" data-bs-toggle="modal" data-bs-target="#inputModal3">Add User</button>
            <button type="button" className="bg-orange-100 text-orange-800 px-4 py-2 rounded-md font-medium hover:bg-orange-200 shadow-sm" data-bs-toggle="modal" data-bs-target="#inputModal4">Leave Trip</button>
          </div>
        </div>

        {/* Tailwind Styled Trip Cards replacing the raw UL/Table */}
        <div className="grid grid-cols-1 gap-6">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-mono text-sm text-gray-500">Trip ID: {trip._id}</span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">City</th>
                        <th className="px-6 py-4">Start Date</th>
                        <th className="px-6 py-4">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trip.legs.map((leg, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{leg.city}</td>
                          <td className="px-6 py-4">{leg.startDate}</td>
                          <td className="px-6 py-4">{leg.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
               No trips found. Click &apos;Create Trip&apos; to get started!
            </div>
          )}
        </div>
      </main>

      {/* --- ALL BOOTSTRAP MODALS RETAIN THEIR EXACT HTML STRUCTURE --- */}
      <div className="modal fade" id="inputModal0" tabIndex={-1} ref={createModalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={onAddSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Create Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                {newTrip.legs.map((leg, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                    <h6 className="font-bold text-slate-700">Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-2" placeholder="City" value={leg.city} onChange={(e) => updateLeg(index, "city", e.target.value)} required />
                    <input type="date" className="form-control mb-2" value={leg.startDate} onChange={(e) => updateLeg(index, "startDate", e.target.value)} required />
                    <input type="date" className="form-control mb-2" value={leg.endDate} onChange={(e) => updateLeg(index, "endDate", e.target.value)} required />
                    {newTrip.legs.length > 1 && ( <button type="button" className="btn btn-sm btn-danger mt-2" onClick={() => removeLeg(index)}>Remove Leg</button> )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" onClick={addLeg}>+ Add Another Leg</button>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary w-full">Create Trip</button>
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
                <h5 className="modal-title">Edit Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-3" onChange={onEditSelectChange} value={editTripId}>
                  <option value="">Select a Trip</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!editedTrip && <p className="text-gray-500">Select a trip to edit.</p>}
                {editedTrip?.legs.map((leg, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                    <h6 className="font-bold text-slate-700">Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-2" value={leg.city} onChange={(e) => updateEditedLeg(index, "city", e.target.value)} />
                    <input type="date" className="form-control mb-2" value={leg.startDate} onChange={(e) => updateEditedLeg(index, "startDate", e.target.value)} />
                    <input type="date" className="form-control mb-2" value={leg.endDate} onChange={(e) => updateEditedLeg(index, "endDate", e.target.value)} />
                    <div className="flex space-x-2 mt-2">
                        <button type="button" className="btn btn-sm btn-danger flex-1" onClick={() => removeEditedLeg(index)}>Remove Leg</button>
                        <button type="button" className="btn btn-sm btn-secondary flex-1" onClick={addEditedLeg}>+ Add Leg</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary w-full" disabled={!editedTrip}>Save Changes to Trip</button>
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
                <select className="form-control mb-3" onChange={onDeleteSelectChange} value={deleteTripId}>
                  <option value="">Select a Trip</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!deletePreviewTrip && <p className="text-gray-500">Select a trip to delete.</p>}
                {deletePreviewTrip?.legs.map((leg, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-gray-50 opacity-70">
                    <h6>Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-2" value={leg.city} disabled={true} />
                    <input type="date" className="form-control mb-2" value={leg.startDate} disabled={true} />
                    <input type="date" className="form-control mb-2" value={leg.endDate} disabled={true} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-danger w-full" disabled={!deletePreviewTrip}>Delete Trip Permanently</button>
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
                <h5 className="modal-title font-bold text-green-700">Add User to Trip</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <select className="form-control mb-3" onChange={onAddUserSelectChange} value={addUserTripId}>
                  <option value="">Select a Trip</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!addUserPreviewTrip && <p className="text-gray-500">Select a trip to add user.</p>}
                {addUserPreviewTrip?.legs.map((leg, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-gray-50 opacity-70">
                    <h6>Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-2" value={leg.city} disabled={true} />
                  </div>
                ))}
                {addUserPreviewTrip && (
                    <div className="mt-4 pt-4 border-t">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Invite Username</label>
                        <input type="text" className="form-control" placeholder="Enter exactly as registered" value={editedUser} onChange={(e) => setEditedUser(e.target.value)} required />
                    </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success w-full" disabled={!addUserPreviewTrip}>Grant Access to User</button>
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
                <select className="form-control mb-3" onChange={onDeleteCurrentUserSelectChange} value={deleteCurrentUserTripId}>
                  <option value="">Select a Trip</option>
                  {trips.map((trip) => (<option key={trip._id} value={trip._id}>{trip._id}</option>))}
                </select>
                {!deleteCurrentUserPreviewTrip && (<p className="text-gray-500">Select a trip to leave.</p>)}
                {deleteCurrentUserPreviewTrip?.legs.map((leg, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-gray-50 opacity-70">
                    <h6>Leg {index + 1}</h6>
                    <input type="text" className="form-control mb-2" value={leg.city} disabled={true} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-warning w-full" disabled={!deleteCurrentUserPreviewTrip}>Remove Me From This Trip</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="logoutModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content p-4">
            <form onSubmit={onLogoutSubmit}>
              <div className="text-center mb-4">
                <h5 className="text-xl font-bold text-slate-800">Ready to leave?</h5>
                <p className="text-gray-500 text-sm mt-2">You will need your TOTP code to log back in.</p>
              </div>
              <div className="flex space-x-3">
                 <button type="button" className="btn btn-secondary flex-1" data-bs-dismiss="modal">Cancel</button>
                 <button type="submit" className="btn btn-danger flex-1" data-bs-dismiss="modal">Logout</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}