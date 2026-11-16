"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Programme = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};
type Presenter = {
  id: string;
  name: string;
  radio_nickname: string | null;
  photo_url: string | null;
  is_active: boolean;
};
type Assignment = {
  id: string;
  programme_id: string;
  presenter_id: string;
  role: string;
  display_order: number;
  presenters: {
    name: string;
    radio_nickname: string | null;
    photo_url: string | null;
  } | null;
};
export default function ProgrammePresentersPage() {
  async function removeAssignment(assignmentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this presenter from the programme?",
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("programme_presenters")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== assignmentId),
    );

    setMessage("Presenter removed from programme successfully!");
  }
  async function updateAssignment(assignmentId: string) {
    if (editingDisplayOrder < 1) {
      setMessage("Display order must be at least 1.");
      return;
    }

    setUpdatingAssignment(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("programme_presenters")
      .update({
        role: editingRole,
        display_order: editingDisplayOrder,
      })
      .eq("id", assignmentId);

    if (error) {
      setMessage(error.message);
    } else {
      setAssignments((current) =>
        current
          .map((assignment) =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  role: editingRole,
                  display_order: editingDisplayOrder,
                }
              : assignment,
          )
          .sort((a, b) => a.display_order - b.display_order),
      );

      setEditingAssignmentId(null);
      setMessage("Assignment updated successfully!");
    }

    setUpdatingAssignment(false);
  }
  async function saveAssignment() {
    if (!selectedProgrammeId || !selectedPresenterId) {
      setMessage("Please select a programme and a presenter.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("programme_presenters").insert({
      programme_id: selectedProgrammeId,
      presenter_id: selectedPresenterId,
      role: selectedRole,
      display_order: displayOrder,
    });

    if (error) {
      setMessage(
        error.code === "23505"
          ? "This presenter is already assigned to this programme."
          : error.message,
      );
    } else {
      setMessage("Presenter assigned successfully!");
      setSelectedPresenterId("");
      setSelectedRole("Host");
      setDisplayOrder(1);
    }

    setSaving(false);
  }
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null,
  );
  const [editingRole, setEditingRole] = useState("Host");
  const [editingDisplayOrder, setEditingDisplayOrder] = useState(1);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedPresenterId, setSelectedPresenterId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Host");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProgrammes() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("radio_programmes")
        .select("id, name, slug, is_active")
        .order("name", { ascending: true });

      if (error) {
        setMessage(error.message);
      } else {
        setProgrammes((data as Programme[]) || []);
      }
      const { data: presenterData, error: presenterError } = await supabase
        .from("presenters")
        .select("id, name, radio_nickname, photo_url, is_active")
        .order("name", { ascending: true });

      if (presenterError) {
        setMessage(presenterError.message);
      } else {
        setPresenters((presenterData as Presenter[]) || []);
      }
      setLoading(false);
    }

    loadProgrammes();
  }, []);

  useEffect(() => {
    async function loadAssignments() {
      if (!selectedProgrammeId) {
        setAssignments([]);
        return;
      }

      setAssignmentsLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("programme_presenters")
        .select(
          `
          id,
          programme_id,
          presenter_id,
          role,
          display_order,
          presenters (
            name,
            radio_nickname,
            photo_url
          )
        `,
        )
        .eq("programme_id", selectedProgrammeId)
        .order("display_order", { ascending: true });

      if (error) {
        setMessage(error.message);
      } else {
        setAssignments((data as unknown as Assignment[]) || []);
      }

      setAssignmentsLoading(false);
    }

    loadAssignments();
  }, [selectedProgrammeId]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#071d49]">
          Programme Presenters
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Assign presenters to ALASS Radio programmes and manage their roles.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {message && (
          <div
            className={`mb-5 rounded-lg p-4 text-sm font-medium ${
              message.includes("successfully")
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <h2 className="text-lg font-bold text-[#071d49]">Select a Programme</h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading programmes...</p>
        ) : programmes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No programmes found.</p>
        ) : (
          <select
            className="mt-4 w-full max-w-xl rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#071d49]"
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
          >
            <option value="" disabled>
              Choose a radio programme
            </option>

            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
                {!programme.is_active ? " (Inactive)" : ""}
              </option>
            ))}
          </select>
        )}
        {selectedProgrammeId && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Selected Programme</p>

            <h3 className="mt-1 text-lg font-bold text-[#071d49]">
              {
                programmes.find(
                  (programme) => programme.id === selectedProgrammeId,
                )?.name
              }
            </h3>
          </div>
        )}

        {selectedProgrammeId && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-[#071d49]">
              Available Presenters
            </h3>
            <div className="mt-5 rounded-lg border border-slate-200 p-5">
              <h4 className="font-bold text-[#071d49]">Assign a Presenter</h4>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Select Presenter
                  </label>

                  <select
                    value={selectedPresenterId}
                    onChange={(e) => setSelectedPresenterId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
                  >
                    <option value="">Choose presenter</option>

                    {presenters
                      .filter(
                        (presenter) =>
                          presenter.is_active &&
                          !assignments.some(
                            (assignment) =>
                              assignment.presenter_id === presenter.id,
                          ),
                      )
                      .map((presenter) => (
                        <option key={presenter.id} value={presenter.id}>
                          {presenter.name}
                          {presenter.radio_nickname
                            ? ` (${presenter.radio_nickname})`
                            : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Presenter Role
                  </label>

                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
                  >
                    <option value="Host">Host</option>
                    <option value="Co-host">Co-host</option>
                    <option value="Guest Presenter">Guest Presenter</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
                  />
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={saveAssignment}
                  disabled={!selectedPresenterId || saving}
                  className="rounded-lg bg-[#071d49] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e31b23] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </div>
            {assignmentsLoading ? (
              <p className="mt-4 text-sm text-slate-500">
                Loading assigned presenters...
              </p>
            ) : assignments.length === 0 ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  No presenters have been assigned to this programme yet.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-4"
                  >
                    {assignment.presenters?.photo_url ? (
                      <img
                        src={assignment.presenters.photo_url}
                        alt={assignment.presenters.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        👤
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#071d49]">
                        {assignment.presenters?.name}
                      </h4>

                      {assignment.presenters?.radio_nickname && (
                        <p className="text-sm text-slate-500">
                          On air: {assignment.presenters.radio_nickname}
                        </p>
                      )}

                      <p className="mt-1 text-sm font-semibold text-[#e31b23]">
                        {assignment.role}
                      </p>
                    </div>
                    {editingAssignmentId === assignment.id && (
                      <div className="w-full rounded-lg bg-slate-50 p-4">
                        <h4 className="mb-3 font-bold text-[#071d49]">
                          Edit Presenter Assignment
                        </h4>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-600">
                              Presenter Role
                            </label>

                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
                            >
                              <option value="Host">Host</option>
                              <option value="Co-host">Co-host</option>
                              <option value="Guest Presenter">
                                Guest Presenter
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-600">
                              Display Order
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={editingDisplayOrder}
                              onChange={(e) =>
                                setEditingDisplayOrder(Number(e.target.value))
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => updateAssignment(assignment.id)}
                            disabled={updatingAssignment}
                            className="rounded-lg bg-[#071d49] px-5 py-2 text-sm font-bold text-white hover:bg-[#e31b23] disabled:opacity-50"
                          >
                            {updatingAssignment ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingAssignmentId(null)}
                            disabled={updatingAssignment}
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAssignmentId(assignment.id);
                        setEditingRole(assignment.role);
                        setEditingDisplayOrder(assignment.display_order);
                        setMessage("");
                      }}
                      className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAssignment(assignment.id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
