"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Trip, EditableTrip, Attraction, HotelStay } from "@/trip_types";

export default function TripDetail() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [editedTrip, setEditedTrip] = useState<EditableTrip | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const editModalRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTripDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      if (response.status === 401) { router.push("/login"); return; }
      if (!response.ok) throw new Error("Failed to fetch trip details.");
      
      const data = await response.json();
      setTrip(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    const load = async () => {
      await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
      fetchTripDetails();
    };
    load();
  }, [fetchTripDetails]);

  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editedTrip) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(editedTrip) 
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to save trip details.");

      await fetchTripDetails();
      showToast("Trip details updated!", "success");
      
      // Close Modal
      const bootstrap = await import("@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js");
      if (editModalRef.current) {
        const modal = bootstrap.Modal.getInstance(editModalRef.current) || new bootstrap.Modal(editModalRef.current);
        modal.hide();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const initEditMode = () => {
    if (trip) {
      setEditedTrip({
        _id: trip._id,
        name: trip.name,
        legs: [...trip.legs],
        hotels: [...trip.hotels],
      });
    }
  };

  // ----- Complex State Updaters for the Modal -----
  const updateLeg = (idx: number, field: string, value: string) => {
    if (!editedTrip) return;
    const newLegs = [...editedTrip.legs];
    newLegs[idx] = { ...newLegs[idx], [field]: value };
    setEditedTrip({ ...editedTrip, legs: newLegs });
  };

  const addAttraction = (legIdx: number) => {
    if (!editedTrip) return;
    const newLegs = [...editedTrip.legs];
    newLegs[legIdx].attractions = [...newLegs[legIdx].attractions, { name: "", description: "" }];
    setEditedTrip({ ...editedTrip, legs: newLegs });
  };

  const updateAttraction = (legIdx: number, attrIdx: number, field: keyof Attraction, value: string) => {
    if (!editedTrip) return;
    const newLegs = [...editedTrip.legs];
    newLegs[legIdx].attractions[attrIdx] = { ...newLegs[legIdx].attractions[attrIdx], [field]: value };
    setEditedTrip({ ...editedTrip, legs: newLegs });
  };

  const removeAttraction = (legIdx: number, attrIdx: number) => {
    if (!editedTrip) return;
    const newLegs = [...editedTrip.legs];
    newLegs[legIdx].attractions = newLegs[legIdx].attractions.filter((_, i) => i !== attrIdx);
    setEditedTrip({ ...editedTrip, legs: newLegs });
  };

  const addHotel = () => {
    if (!editedTrip) return;
    setEditedTrip({ ...editedTrip, hotels: [...editedTrip.hotels, { hotelName: "", checkIn: "", checkOut: "" }] });
  };

  const updateHotel = (idx: number, field: keyof HotelStay, value: string) => {
    if (!editedTrip) return;
    const newHotels = [...editedTrip.hotels];
    newHotels[idx] = { ...newHotels[idx], [field]: value };
    setEditedTrip({ ...editedTrip, hotels: newHotels });
  };

  const removeHotel = (idx: number) => {
    if (!editedTrip) return;
    setEditedTrip({ ...editedTrip, hotels: editedTrip.hotels.filter((_, i) => i !== idx) });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-slate-500">Loading trip details...</div>;
  if (!trip) return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-red-500">Trip not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-9999 animate-in fade-in">
          <div className={`px-6 py-4 rounded-lg shadow-xl font-bold flex items-center gap-3 border ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 shadow-inner relative">
        <div className="max-w-5xl mx-auto">
            <button onClick={() => router.push('/trips')} className="text-blue-400 hover:text-blue-300 font-bold text-sm mb-4 flex items-center gap-1 transition-colors">
                ← Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{trip.name}</h1>
            <p className="text-slate-400 font-medium">Trip ID: <span className="font-mono text-slate-500">{trip._id}</span></p>
        </div>
      </div>

      {/* Main Content Area (Pulled up over the banner) */}
      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        
        {/* Action Bar & Roster Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">Travelers:</span>
                {trip.usernames.length > 0 ? trip.usernames.map((u, i) => (
                    <span key={i} className={`px-3 py-1.5 text-xs rounded-full font-bold shadow-sm border ${i === 0 ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {i === 0 ? '👑 ' : ''}{u}
                    </span>
                )) : <span className="text-sm text-slate-400 italic">No users found</span>}
            </div>
            <button onClick={initEditMode} data-bs-toggle="modal" data-bs-target="#editDetailsModal" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors w-full md:w-auto">
                ✏️ Edit Itinerary
            </button>
        </div>

        {/* Accommodations Section */}
        {trip.hotels.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">🏨 Accommodations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trip.hotels.map((hotel, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                            <h4 className="font-bold text-lg text-slate-800 mb-2">{hotel.hotelName}</h4>
                            <div className="flex flex-col gap-1 text-sm text-slate-600 font-medium">
                                <span className="flex justify-between"><span>Check In:</span> <span className="text-slate-900">{hotel.checkIn}</span></span>
                                <span className="flex justify-between"><span>Check Out:</span> <span className="text-slate-900">{hotel.checkOut}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Itinerary / Legs Section */}
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">🗺️ Itinerary</h2>
            <div className="space-y-6">
                {trip.legs.map((leg, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                        {/* Leg Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <h3 className="text-xl font-extrabold text-slate-800">📍 {leg.city}</h3>
                            <div className="bg-white px-3 py-1 rounded-md border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                                {leg.startDate} <span className="text-slate-400 font-normal mx-1">to</span> {leg.endDate}
                            </div>
                        </div>

                        {/* Leg Body */}
                        <div className="p-6">
                            {/* Notes */}
                            {leg.note && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">Trip Notes</h5>
                                    <p className="text-sm text-yellow-900 whitespace-pre-wrap">{leg.note}</p>
                                </div>
                            )}

                            {/* Attractions */}
                            <h5 className="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">Things To Do / Attractions</h5>
                            {leg.attractions && leg.attractions.length > 0 ? (
                                <ul className="space-y-3">
                                    {leg.attractions.map((attr, aIdx) => (
                                        <li key={aIdx} className="flex gap-3 items-start">
                                            <div className="mt-1 bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">{aIdx + 1}</div>
                                            <div>
                                                <span className="font-bold text-slate-800 block">{attr.name}</span>
                                                {attr.description && <span className="text-sm text-slate-600">{attr.description}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No attractions planned for this leg yet.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>

      {/* --- EDIT DETAILS MODAL --- */}
      <div className="modal fade" id="editDetailsModal" tabIndex={-1} ref={editModalRef} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header bg-slate-50 border-b border-slate-200">
                <h5 className="modal-title font-bold text-slate-800">Edit Itinerary Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body bg-slate-50/50 p-4 overflow-y-auto max-h-[70vh]">
                {editedTrip && (
                  <>
                    {/* General Name */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
                        <label className="text-sm font-bold text-slate-700 mb-1 block">Trip Name</label>
                        <input type="text" className="form-control font-bold" value={editedTrip.name} onChange={(e) => setEditedTrip({...editedTrip, name: e.target.value})} required />
                    </div>

                    {/* Hotels Manager */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h6 className="font-bold text-slate-800 text-lg">🏨 Hotels & Stays</h6>
                            <button type="button" onClick={addHotel} className="btn btn-sm btn-outline-primary font-bold">+ Add Stay</button>
                        </div>
                        {editedTrip.hotels.map((hotel, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-md p-3 mb-3 bg-slate-50 relative">
                                <button type="button" onClick={() => removeHotel(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl leading-none">&times;</button>
                                <input type="text" className="form-control form-control-sm mb-2 font-bold w-11/12" placeholder="Hotel Name" value={hotel.hotelName} onChange={(e) => updateHotel(idx, 'hotelName', e.target.value)} required/>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-[10px] uppercase font-bold text-slate-500">Check In</label><input type="date" className="form-control form-control-sm" value={hotel.checkIn} onChange={(e) => updateHotel(idx, 'checkIn', e.target.value)} required/></div>
                                    <div><label className="text-[10px] uppercase font-bold text-slate-500">Check Out</label><input type="date" className="form-control form-control-sm" value={hotel.checkOut} onChange={(e) => updateHotel(idx, 'checkOut', e.target.value)} required/></div>
                                </div>
                            </div>
                        ))}
                        {editedTrip.hotels.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No stays added yet.</p>}
                    </div>

                    {/* Legs Manager */}
                    <h6 className="font-bold text-slate-800 text-lg mb-3">🗺️ Trip Legs & Attractions</h6>
                    {editedTrip.legs.map((leg, legIdx) => (
                        <div key={legIdx} className="bg-white p-4 rounded-lg border border-slate-200 mb-4 shadow-sm border-l-4 border-l-slate-800">
                            <div className="flex gap-2 mb-3">
                                <input type="text" className="form-control font-bold" placeholder="City" value={leg.city} onChange={(e) => updateLeg(legIdx, "city", e.target.value)} required />
                                <input type="date" className="form-control w-auto" value={leg.startDate} onChange={(e) => updateLeg(legIdx, "startDate", e.target.value)} required />
                                <input type="date" className="form-control w-auto" value={leg.endDate} onChange={(e) => updateLeg(legIdx, "endDate", e.target.value)} required />
                            </div>
                            
                            <textarea className="form-control text-sm mb-4" rows={2} placeholder="Add notes for this leg..." value={leg.note} onChange={(e) => updateLeg(legIdx, "note", e.target.value)}></textarea>

                            <div className="bg-slate-50 border border-slate-200 rounded p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-600 uppercase">Attractions</span>
                                    <button type="button" onClick={() => addAttraction(legIdx)} className="text-xs text-blue-600 hover:text-blue-800 font-bold">+ Add Item</button>
                                </div>
                                {leg.attractions.map((attr, attrIdx) => (
                                    <div key={attrIdx} className="flex gap-2 mb-2 items-start">
                                        <div className="grow space-y-1">
                                            <input type="text" className="form-control form-control-sm font-bold" placeholder="Attraction Name" value={attr.name} onChange={(e) => updateAttraction(legIdx, attrIdx, "name", e.target.value)} required/>
                                            <input type="text" className="form-control form-control-sm" placeholder="Description or Time (optional)" value={attr.description} onChange={(e) => updateAttraction(legIdx, attrIdx, "description", e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removeAttraction(legIdx, attrIdx)} className="btn btn-sm btn-outline-danger font-bold mt-1">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                  </>
                )}
              </div>
              <div className="modal-footer bg-white border-t border-slate-200">
                <button type="submit" className="btn btn-primary w-full font-bold py-2" disabled={!editedTrip}>Save All Details</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}