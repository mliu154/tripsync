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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const editModalRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTripDetails = useCallback(async () => {
    try {
      const response = await fetch("/api/trips/" + tripId);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch trip details.");
      }

      const data = await response.json();
      setTrip(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch trip details.";

      showToast(message, "error");
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

  const handleEditSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editedTrip) {
      return;
    }

    try {
      const response = await fetch("/api/trips/" + tripId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTrip),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to save trip details.");
      }

      await fetchTripDetails();

      showToast("Trip details updated!", "success");

      const bootstrap = await import(
        "@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js"
      );

      if (editModalRef.current) {
        const modal =
          bootstrap.Modal.getInstance(editModalRef.current) ||
          new bootstrap.Modal(editModalRef.current);

        modal.hide();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save trip details.";

      showToast(message, "error");
    }
  };

  const initEditMode = () => {
    if (!trip) {
      return;
    }

    setEditedTrip({
      _id: trip._id,
      name: trip.name,
      legs: [...trip.legs],
      hotels: [...trip.hotels],
    });
  };

  // ---------------------------------------------------------
  // LEG FUNCTIONS
  // ---------------------------------------------------------

  const updateLeg = (
    index: number,
    field: "city" | "startDate" | "endDate" | "note",
    value: string
  ) => {
    if (!editedTrip) {
      return;
    }

    const updatedLegs = [...editedTrip.legs];

    updatedLegs[index] = {
      ...updatedLegs[index],
      [field]: value,
    };

    setEditedTrip({
      ...editedTrip,
      legs: updatedLegs,
    });
  };

  const addLeg = () => {
    if (!editedTrip) {
      return;
    }

    const newLeg = {
      city: "",
      startDate: "",
      endDate: "",
      note: "",
      attractions: [],
    };

    setEditedTrip({
      ...editedTrip,
      legs: [...editedTrip.legs, newLeg],
    });
  };

  const removeLeg = (index: number) => {
    if (!editedTrip) {
      return;
    }

    if (editedTrip.legs.length <= 1) {
      showToast("A trip must have at least one leg.", "error");
      return;
    }

    setEditedTrip({
      ...editedTrip,
      legs: editedTrip.legs.filter((_, i) => i !== index),
    });
  };

  // ---------------------------------------------------------
  // ATTRACTION FUNCTIONS
  // ---------------------------------------------------------

  const addAttraction = (legIndex: number) => {
    if (!editedTrip) {
      return;
    }

    const updatedLegs = [...editedTrip.legs];

    updatedLegs[legIndex] = {
      ...updatedLegs[legIndex],
      attractions: [
        ...updatedLegs[legIndex].attractions,
        {
          name: "",
          description: "",
        },
      ],
    };

    setEditedTrip({
      ...editedTrip,
      legs: updatedLegs,
    });
  };

  const updateAttraction = (
    legIndex: number,
    attractionIndex: number,
    field: keyof Attraction,
    value: string
  ) => {
    if (!editedTrip) {
      return;
    }

    const updatedLegs = [...editedTrip.legs];

    const updatedAttractions = [
      ...updatedLegs[legIndex].attractions,
    ];

    updatedAttractions[attractionIndex] = {
      ...updatedAttractions[attractionIndex],
      [field]: value,
    };

    updatedLegs[legIndex] = {
      ...updatedLegs[legIndex],
      attractions: updatedAttractions,
    };

    setEditedTrip({
      ...editedTrip,
      legs: updatedLegs,
    });
  };

  const removeAttraction = (
    legIndex: number,
    attractionIndex: number
  ) => {
    if (!editedTrip) {
      return;
    }

    const updatedLegs = [...editedTrip.legs];

    updatedLegs[legIndex] = {
      ...updatedLegs[legIndex],
      attractions: updatedLegs[legIndex].attractions.filter(
        (_, i) => i !== attractionIndex
      ),
    };

    setEditedTrip({
      ...editedTrip,
      legs: updatedLegs,
    });
  };

  // ---------------------------------------------------------
  // HOTEL FUNCTIONS
  // ---------------------------------------------------------

  const addHotel = () => {
    if (!editedTrip) {
      return;
    }

    const newHotel: HotelStay = {
      hotelName: "",
      checkIn: "",
      checkOut: "",
    };

    setEditedTrip({
      ...editedTrip,
      hotels: [...editedTrip.hotels, newHotel],
    });
  };

  const updateHotel = (
    index: number,
    field: keyof HotelStay,
    value: string
  ) => {
    if (!editedTrip) {
      return;
    }

    const updatedHotels = [...editedTrip.hotels];

    updatedHotels[index] = {
      ...updatedHotels[index],
      [field]: value,
    };

    setEditedTrip({
      ...editedTrip,
      hotels: updatedHotels,
    });
  };

  const removeHotel = (index: number) => {
    if (!editedTrip) {
      return;
    }

    setEditedTrip({
      ...editedTrip,
      hotels: editedTrip.hotels.filter((_, i) => i !== index),
    });
  };

  // ---------------------------------------------------------
  // LOADING STATES
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-slate-500">
        Loading trip details...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-red-500">
        Trip not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-9999 animate-in fade-in">
          <div
            className={
              "px-6 py-4 rounded-lg shadow-xl font-bold flex items-center gap-3 border " +
              (toast.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200")
            }
          >
            <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 shadow-inner relative">
        <div className="max-w-5xl mx-auto">

          <button
            onClick={() => router.push("/trips")}
            className="text-blue-400 hover:text-blue-300 font-bold text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            {trip.name}
          </h1>

          <p className="text-slate-400 font-medium">
            Trip ID:{" "}
            <span className="font-mono text-slate-500">
              {trip._id}
            </span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">

        {/* Action Bar & Roster */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">
              Travelers:
            </span>

            {trip.usernames.length > 0 ? (
              trip.usernames.map((username, index) => (
                <span
                  key={index}
                  className={
                    "px-3 py-1.5 text-xs rounded-full font-bold shadow-sm border " +
                    (index === 0
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-blue-50 text-blue-700 border-blue-200")
                  }
                >
                  {index === 0 ? "👑 " : ""}
                  {username}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400 italic">
                No users found
              </span>
            )}
          </div>

          <button
            onClick={initEditMode}
            data-bs-toggle="modal"
            data-bs-target="#editDetailsModal"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors w-full md:w-auto"
          >
            ✏️ Edit Itinerary
          </button>
        </div>

        {/* Accommodations */}
        {trip.hotels.length > 0 && (
          <div className="mb-10">

            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              🏨 Accommodations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trip.hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500"
                >
                  <h4 className="font-bold text-lg text-slate-800 mb-2">
                    {hotel.hotelName}
                  </h4>

                  <div className="flex flex-col gap-1 text-sm text-slate-600 font-medium">
                    <span className="flex justify-between">
                      <span>Check In:</span>
                      <span className="text-slate-900">
                        {hotel.checkIn}
                      </span>
                    </span>

                    <span className="flex justify-between">
                      <span>Check Out:</span>
                      <span className="text-slate-900">
                        {hotel.checkOut}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        <div>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            🗺️ Itinerary
          </h2>

          <div className="space-y-6">
            {trip.legs.map((leg, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
              >

                {/* Leg Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">

                  <h3 className="text-xl font-extrabold text-slate-800">
                    📍 {leg.city}
                  </h3>

                  <div className="bg-white px-3 py-1 rounded-md border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                    {leg.startDate}{" "}
                    <span className="text-slate-400 font-normal mx-1">
                      to
                    </span>{" "}
                    {leg.endDate}
                  </div>

                </div>

                {/* Leg Body */}
                <div className="p-6">

                  {/* Notes */}
                  {leg.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">

                      <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">
                        Trip Notes
                      </h5>

                      <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                        {leg.note}
                      </p>

                    </div>
                  )}

                  {/* Attractions */}
                  <h5 className="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                    Things To Do / Attractions
                  </h5>

                  {leg.attractions && leg.attractions.length > 0 ? (
                    <ul className="space-y-3">
                      {leg.attractions.map((attraction, attractionIndex) => (
                        <li
                          key={attractionIndex}
                          className="flex gap-3 items-start"
                        >
                          <div className="mt-1 bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">
                            {attractionIndex + 1}
                          </div>

                          <div>
                            <span className="font-bold text-slate-800 block">
                              {attraction.name}
                            </span>

                            {attraction.description && (
                              <span className="text-sm text-slate-600">
                                {attraction.description}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No attractions planned for this leg yet.
                    </p>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* EDIT DETAILS MODAL */}
      <div
        className="modal fade"
        id="editDetailsModal"
        tabIndex={-1}
        ref={editModalRef}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">

          <div className="modal-content">

            <form onSubmit={handleEditSubmit}>

              {/* Modal Header */}
              <div className="modal-header bg-slate-50 border-b border-slate-200">

                <h5 className="modal-title font-bold text-slate-800">
                  Edit Itinerary Details
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                />

              </div>

              {/* Modal Body */}
              <div className="modal-body bg-slate-50/50 p-4 overflow-y-auto max-h-[70vh]">

                {editedTrip && (
                  <>

                    {/* General Name */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">

                      <label className="text-sm font-bold text-slate-700 mb-1 block">
                        Trip Name
                      </label>

                      <input
                        type="text"
                        className="form-control font-bold"
                        value={editedTrip.name}
                        onChange={(event) =>
                          setEditedTrip({
                            ...editedTrip,
                            name: event.target.value,
                          })
                        }
                        required
                      />

                    </div>

                    {/* Hotels Manager */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">

                      <div className="flex justify-between items-center mb-4">

                        <h6 className="font-bold text-slate-800 text-lg">
                          🏨 Hotels & Stays
                        </h6>

                        <button
                          type="button"
                          onClick={addHotel}
                          className="btn btn-sm btn-outline-primary font-bold"
                        >
                          + Add Stay
                        </button>

                      </div>

                      {editedTrip.hotels.map((hotel, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-md p-3 mb-3 bg-slate-50 relative"
                        >

                          <button
                            type="button"
                            onClick={() => removeHotel(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl leading-none"
                          >
                            &times;
                          </button>

                          <input
                            type="text"
                            className="form-control form-control-sm mb-2 font-bold w-11/12"
                            placeholder="Hotel Name"
                            value={hotel.hotelName}
                            onChange={(event) =>
                              updateHotel(
                                index,
                                "hotelName",
                                event.target.value
                              )
                            }
                            required
                          />

                          <div className="grid grid-cols-2 gap-2">

                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500">
                                Check In
                              </label>

                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={hotel.checkIn}
                                onChange={(event) =>
                                  updateHotel(
                                    index,
                                    "checkIn",
                                    event.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500">
                                Check Out
                              </label>

                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={hotel.checkOut}
                                onChange={(event) =>
                                  updateHotel(
                                    index,
                                    "checkOut",
                                    event.target.value
                                  )
                                }
                                required
                              />
                            </div>

                          </div>
                        </div>
                      ))}

                      {editedTrip.hotels.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-2">
                          No stays added yet.
                        </p>
                      )}

                    </div>

                    {/* Legs Manager */}
                    <div className="flex justify-between items-center mb-3">

                      <h6 className="font-bold text-slate-800 text-lg">
                        🗺️ Trip Legs & Attractions
                      </h6>

                      <button
                        type="button"
                        onClick={addLeg}
                        className="btn btn-sm btn-outline-primary font-bold"
                      >
                        + Add Leg
                      </button>

                    </div>

                    {/* Existing / New Legs */}
                    {editedTrip.legs.map((leg, legIndex) => (
                      <div
                        key={legIndex}
                        className="bg-white p-4 rounded-lg border border-slate-200 mb-4 shadow-sm border-l-4 border-l-slate-800"
                      >

                        {/* Leg Number / Remove Button */}
                        <div className="flex justify-between items-center mb-3">

                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Leg {legIndex + 1}
                          </span>

                          {editedTrip.legs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLeg(legIndex)}
                              className="btn btn-sm btn-outline-danger font-bold"
                            >
                              Remove Leg
                            </button>
                          )}

                        </div>

                        {/* City / Dates */}
                        <div className="flex gap-2 mb-3">

                          <input
                            type="text"
                            className="form-control font-bold"
                            placeholder="City"
                            value={leg.city}
                            onChange={(event) =>
                              updateLeg(
                                legIndex,
                                "city",
                                event.target.value
                              )
                            }
                            required
                          />

                          <input
                            type="date"
                            className="form-control w-auto"
                            value={leg.startDate}
                            onChange={(event) =>
                              updateLeg(
                                legIndex,
                                "startDate",
                                event.target.value
                              )
                            }
                            required
                          />

                          <input
                            type="date"
                            className="form-control w-auto"
                            value={leg.endDate}
                            onChange={(event) =>
                              updateLeg(
                                legIndex,
                                "endDate",
                                event.target.value
                              )
                            }
                            required
                          />

                        </div>

                        {/* Notes */}
                        <textarea
                          className="form-control text-sm mb-4"
                          rows={2}
                          placeholder="Add notes for this leg..."
                          value={leg.note}
                          onChange={(event) =>
                            updateLeg(
                              legIndex,
                              "note",
                              event.target.value
                            )
                          }
                        />

                        {/* Attractions */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-3">

                          <div className="flex justify-between items-center mb-2">

                            <span className="text-xs font-bold text-slate-600 uppercase">
                              Attractions
                            </span>

                            <button
                              type="button"
                              onClick={() => addAttraction(legIndex)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                            >
                              + Add Item
                            </button>

                          </div>

                          {leg.attractions.map(
                            (attraction, attractionIndex) => (
                              <div
                                key={attractionIndex}
                                className="flex gap-2 mb-2 items-start"
                              >

                                <div className="grow space-y-1">

                                  <input
                                    type="text"
                                    className="form-control form-control-sm font-bold"
                                    placeholder="Attraction Name"
                                    value={attraction.name}
                                    onChange={(event) =>
                                      updateAttraction(
                                        legIndex,
                                        attractionIndex,
                                        "name",
                                        event.target.value
                                      )
                                    }
                                    required
                                  />

                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Description or Time (optional)"
                                    value={attraction.description}
                                    onChange={(event) =>
                                      updateAttraction(
                                        legIndex,
                                        attractionIndex,
                                        "description",
                                        event.target.value
                                      )
                                    }
                                  />

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAttraction(
                                      legIndex,
                                      attractionIndex
                                    )
                                  }
                                  className="btn btn-sm btn-outline-danger font-bold mt-1"
                                >
                                  &times;
                                </button>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    ))}

                    {/* Add Leg Button */}
                    <button
                      type="button"
                      onClick={addLeg}
                      className="btn btn-outline-secondary w-full border-dashed font-bold mb-2"
                    >
                      + Add Another Destination
                    </button>

                  </>
                )}

              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-white border-t border-slate-200">

                <button
                  type="submit"
                  className="btn btn-primary w-full font-bold py-2"
                  disabled={!editedTrip}
                >
                  Save All Details
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>

    </div>
  );
}