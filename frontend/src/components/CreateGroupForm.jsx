import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/groups";
const CURRENT_USER_ID = "demo-user";

function CreateGroupForm({
  initialData = null,
  onSubmit,
  onClose,
}) {
  const [groupName, setGroupName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [memberLimit, setMemberLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setGroupName(initialData.name || "");
      setSubject(initialData.subject || "");
      setDescription(initialData.description || "");
      setMemberLimit(
        initialData.memberLimit
          ? String(initialData.memberLimit)
          : ""
      );
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setGroupName("");
    setSubject("");
    setDescription("");
    setMemberLimit("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!groupName.trim() || !subject.trim() || !description.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (!memberLimit || Number(memberLimit) < 1) {
      alert("Please enter a valid member limit.");
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode
        ? `${API_URL}/${initialData._id || initialData.id}`
        : API_URL;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName.trim(),
          subject: subject.trim(),
          description: description.trim(),
          memberLimit: Number(memberLimit),
          creatorId: CURRENT_USER_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditMode ? "update" : "create"} group`
        );
      }

      alert(
        isEditMode
          ? "Study group updated successfully!"
          : "Study group created successfully!"
      );

      resetForm();

      if (onSubmit) {
        onSubmit(data.group || data);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.message ||
          `Could not ${isEditMode ? "update" : "create"} group.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="create-group-form">
      <h2>
        {isEditMode
          ? "Edit Study Group"
          : "Create a Study Group"}
      </h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="groupName">Group Name</label>

        <input
          id="groupName"
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          required
        />

        <label htmlFor="subject">Subject</label>

        <input
          id="subject"
          type="text"
          placeholder="Enter subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
        />

        <label htmlFor="description">Description</label>

        <textarea
          id="description"
          placeholder="Enter group description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <label htmlFor="memberLimit">Member Limit</label>

        <input
          id="memberLimit"
          type="number"
          placeholder="Enter member limit"
          min="1"
          max="1000"
          value={memberLimit}
          onChange={(event) => setMemberLimit(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditMode
            ? "Update Group"
            : "Create Group"}
        </button>

        {isEditMode && (
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default CreateGroupForm;