'use client'
import React, {
    useState,
    useEffect,
    useRef
} from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import type { Trip, CreateTripRequest, EditableTrip } from '@/trip_types';
export default function Home(){
type NewTrip = {
  legs: {
    city: string;
    startDate: string;
    endDate: string;
  }[];
};    
    const [trips, setTrips] = useState<Trip[]>([]);
    const [newTrip, setNewTrip] = useState<NewTrip>({
  legs: [
    {
      city: '',
      startDate: '',
      endDate: '',
    },
  ],
});
    const [editedTrip, setEditedTrip] = useState<EditableTrip | null>(null);;
    const [deletePreviewTrip, setDeletePreviewTrip] = useState<Trip | null>(null);
    const createModalRef = useRef<HTMLDivElement>(null);
    const editModalRef = useRef<HTMLDivElement>(null);
    const deleteModalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [editTripId, setEditTripId] = useState('');
    const [deleteTripId, setDeleteTripId] = useState('');
    const addLeg = () => {
  setNewTrip({
    ...newTrip,
    legs: [
      ...newTrip.legs,
      { city: '', startDate: '', endDate: '' },
    ],
  });
};

const updateLeg = (
  index: number,
  field: 'city' | 'startDate' | 'endDate',
  value: string
) => {
  const updatedLegs = [...newTrip.legs];
  updatedLegs[index] = {
    ...updatedLegs[index],
    [field]: value,
  };

  setNewTrip({
    ...newTrip,
    legs: updatedLegs,
  });
};

const removeLeg = (index: number) => {
  const updatedLegs = newTrip.legs.filter((_, i) => i !== index);
  setNewTrip({
    ...newTrip,
    legs: updatedLegs,
  });
};
    const fetchTrips = async () => {
    try {
        const response = await fetch('/api/trips');

        if (response.status === 401) {
            router.push('/login');
            return;
        }

        const data = await response.json();
        setTrips(data);
    } catch (error) {
        console.error(error);
    }
};
const updateEditedLeg = (
  index: number,
  field: 'city' | 'startDate' | 'endDate',
  value: string
) => {
  if (!editedTrip) return;

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
const updateDeletedLeg = (
  index: number,
  field: 'city' | 'startDate' | 'endDate',
  value: string
) => {
  if (!deletePreviewTrip) return;

  const updatedLegs = [...deletePreviewTrip.legs];

  updatedLegs[index] = {
    ...updatedLegs[index],
    [field]: value,
  };

  setDeletePreviewTrip({
    ...deletePreviewTrip,
    legs: updatedLegs,
  });
};


    const handleTripSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  newTrip: CreateTripRequest,
  fetchTrips: () => Promise<void>
) => {
  e.preventDefault();

  await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTrip),
  });

  await fetchTrips();
};

    useEffect(() => {
  const load = async () => {
    await import('@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js');
    fetchTrips();
  };

  load();
}, []);


 const handleEditTripSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  editedTrip: EditableTrip,
  fetchTrips: () => Promise<void>
) => {
  e.preventDefault();

  const { _id, legs } = editedTrip;

  await fetch(`/api/trips/${_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ legs }),
  });

  await fetchTrips();
};

const handleDeleteTrip = async (
  deleteTripId: string,
  fetchTrips: () => Promise<void>
) => {
  if (!deleteTripId) return;

  await fetch(`/api/trips/${deleteTripId}`, {
    method: 'DELETE',
  });

  await fetchTrips();
};
    
    const onAddSubmit = ( e: React.FormEvent<HTMLFormElement>) => {
        handleTripSubmit(e, newTrip, fetchTrips);
        resetNewTrip();
        closeModal(createModalRef);
    };
    const onEditSubmit = (
  e: React.FormEvent<HTMLFormElement>
) => {
  if (!editedTrip) return;

  handleEditTripSubmit(
    e,
    editedTrip,
    fetchTrips
  );
  closeModal(editModalRef);
};
    const onEditSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value; 
    setEditTripId(id);
    const trip = trips.find((t) => t._id === id);
    if (trip) {
        setEditedTrip({
            _id: trip._id,
            legs: trip.legs,
        });
    }
};
const addEditedLeg = () => {
  if (!editedTrip) return;

  setEditedTrip({
    ...editedTrip,
    legs: [
      ...editedTrip.legs,
      {
        city: '',
        startDate: '',
        endDate: '',
      },
    ],
  });
};
const removeEditedLeg = (index: number) => {
  if (!editedTrip) return;

  setEditedTrip({
    ...editedTrip,
    legs: editedTrip.legs.filter((_, i) => i !== index),
  });
};
    const onDeleteSubmit = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleDeleteTrip(deleteTripId, fetchTrips);
        closeModal(deleteModalRef);
    };
    const onDeleteSelectChange = ( e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setDeleteTripId(id);
        const trip = trips.find((t) => t._id === id);
        if (trip) {
            setDeletePreviewTrip(trip);
        } else {
            setDeletePreviewTrip(null);
        }
    };
const closeModal = async (
  modalRef: React.RefObject<HTMLDivElement | null>
) => {
  const bootstrap = await import(
    '@/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js'
  );

  if (modalRef.current) {
    const modal =
      bootstrap.Modal.getInstance(modalRef.current) ||
      new bootstrap.Modal(modalRef.current);

    modal.hide();
  }
};
const resetNewTrip = () => {
  setNewTrip({
    legs: [
      {
        city: '',
        startDate: '',
        endDate: '',
      },
    ],
  });
};
    
  return (
  <div>
    <h1>My Trips</h1>
    <br />
    <ul>
      {trips.length > 0 ? (
        trips.map((trip) => <li key={trip._id}>{trip._id}
	<br />
	<table style={{ borderCollapse: 'collapse' }}>
  <thead>
     <tr>
     	<th style={{ border: '5px solid #cccccc' }}>City</th>
     	<th style={{ border: '5px solid #cccccc' }}>Start Date</th>
     	<th style={{ border: '5px solid #cccccc' }}>End Date</th>
     </tr>
  </thead>
  <tbody>
    {trip.legs.map((leg, index) => (
      <tr key={index}>
        <td style={{ border: '5px solid #cccccc' }}>
          {leg.city}
        </td>
        <td style={{ border: '5px solid #cccccc' }}>
          {leg.startDate}
        </td>
        <td style={{ border: '5px solid #cccccc' }}>
          {leg.endDate}
        </td>
      </tr>
    ))}
  </tbody>
</table>
</li>)
      ) : (
        <li>No trips found</li>
      )}
    </ul>

    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#inputModal0">
                Create Trip
            </button>
            <button type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#inputModal1">
                Edit Trip
            </button>
            <button type="button" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#inputModal2">
                Delete Trip
            </button>
    <div className="modal fade" id="inputModal0" tabIndex={-1} ref={createModalRef}>
  <div className="modal-dialog">
    <div className="modal-content">

      <form onSubmit={onAddSubmit}>

        <div className="modal-header">
          <h5 className="modal-title">Create Trip</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
          />
        </div>

        <div className="modal-body">
          {newTrip.legs.map((leg, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <h6>Leg {index + 1}</h6>

              <input
                type="text"
                className="form-control mb-2"
                placeholder="City"
                value={leg.city}
                onChange={(e) =>
                  updateLeg(index, 'city', e.target.value)
                }
                required
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.startDate}
                onChange={(e) =>
                  updateLeg(index, 'startDate', e.target.value)
                }
                required
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.endDate}
                onChange={(e) =>
                  updateLeg(index, 'endDate', e.target.value)
                }
                required
              />

              {newTrip.legs.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeLeg(index)}
                >
                  Remove Leg
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addLeg}
          >
            + Add Another Leg
          </button>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn btn-primary">
            Create Trip
          </button>
        </div>

      </form>

    </div>
  </div>
</div>
    
<div
  className="modal fade"
  id="inputModal1"
  tabIndex={-1}
  ref={editModalRef}
  aria-labelledby="inputModalLabel1"
  aria-hidden="true"
>
  <div className="modal-dialog">
    <div className="modal-content">

      <form onSubmit={onEditSubmit}>

        <div className="modal-header">
          <h5 className="modal-title" id="inputModalLabel1">
            Edit Trip
          </h5>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
          />
        </div>

        <div className="modal-body">

          <select
            className="form-control mb-2"
            onChange={onEditSelectChange}
            value={editTripId}
          >
            <option value="">Select a Trip</option>

            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip._id}
              </option>
            ))}
          </select>

          {!editedTrip && (
            <p>Select a trip to edit.</p>
          )}

          {editedTrip?.legs.map((leg, index) => (
            <div
              key={index}
              className="border rounded p-3 mb-3"
            >
              <h6>Leg {index + 1}</h6>

              <input
                type="text"
                className="form-control mb-2"
                value={leg.city}
                onChange={(e) =>
                  updateEditedLeg(
                    index,
                    'city',
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.startDate}
                onChange={(e) =>
                  updateEditedLeg(
                    index,
                    'startDate',
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.endDate}
                onChange={(e) =>
                  updateEditedLeg(
                    index,
                    'endDate',
                    e.target.value
                  )
                }
              />
              <button
  type="button"
  className="btn btn-danger"
  onClick={() => removeEditedLeg(index)}
>
  Remove Leg
</button>
<button
  type="button"
  className="btn btn-secondary"
  onClick={addEditedLeg}
>
  + Add Another Leg
</button>
            </div>
          ))}

        </div>

        <div className="modal-footer">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!editedTrip}
          >
            Save Changes to Trip
          </button>
        </div>

      </form>

    </div>
  </div>
</div>

    
     <div
  className="modal fade"
  id="inputModal2"
  tabIndex={-1}
  aria-labelledby="inputModalLabel2"
  ref={deleteModalRef}
  aria-hidden="true"
>
  <div className="modal-dialog">
    <div className="modal-content">

      <form onSubmit={onDeleteSubmit}>

        <div className="modal-header">
          <h5 className="modal-title" id="inputModalLabel1">
            Delete Trip
          </h5>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
          />
        </div>

        <div className="modal-body">

          <select
            className="form-control mb-2"
            onChange={onDeleteSelectChange}
            value={deleteTripId}
          >
            <option value="">Select a Trip</option>

            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip._id}
              </option>
            ))}
          </select>

          {!deletePreviewTrip && (
            <p>Select a trip to delete.</p>
          )}

          {deletePreviewTrip?.legs.map((leg, index) => (
            <div
              key={index}
              className="border rounded p-3 mb-3"
            >
              <h6>Leg {index + 1}</h6>

              <input
                type="text"
                className="form-control mb-2"
                value={leg.city}
                disabled={true}
                onChange={(e) =>
                  updateDeletedLeg(
                    index,
                    'city',
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.startDate}
                disabled={true}
                onChange={(e) =>
                  updateDeletedLeg(
                    index,
                    'startDate',
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                className="form-control mb-2"
                value={leg.endDate}
                disabled={true}
                onChange={(e) =>
                  updateDeletedLeg(
                    index,
                    'endDate',
                    e.target.value
                  )
                }
              />
            </div>
          ))}

        </div>

        <div className="modal-footer">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!deletePreviewTrip}
          >
            Delete Trip
          </button>
        </div>

      </form>

    </div>
  </div>
</div>
</div>
);}
