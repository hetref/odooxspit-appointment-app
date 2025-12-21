"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  Plus,
  Bot,
  Pencil,
  Trash2,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
} from "lucide-react";
import { bolnaApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface Agent {
  id: string;
  bolnaAgentId: string;
  name: string;
  welcomeMessage: string;
  instructions: string;
  language: string;
  voiceId: string | null;
  isActive: boolean;
  callCount: number;
  createdAt: string;
  updatedAt: string;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export default function VoiceAgentsPage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    welcomeMessage: "",
    instructions: "",
    language: "en",
  });

  // Call state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const response = await bolnaApi.getAgents(accessToken);

      if (response.success && response.data) {
        setAgents(response.data.agents);
      } else {
        setError(response.message || "Failed to load agents");
      }
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError(err.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.welcomeMessage || !formData.instructions) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const response = await bolnaApi.createAgent(accessToken, formData);

      if (response.success) {
        setSuccessMessage("Agent created successfully");
        setShowCreateDialog(false);
        setFormData({ name: "", welcomeMessage: "", instructions: "", language: "en" });
        fetchAgents();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to create agent");
      }
    } catch (err: any) {
      console.error("Error creating agent:", err);
      setError(err.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent || !formData.name || !formData.welcomeMessage || !formData.instructions) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const response = await bolnaApi.updateAgent(accessToken, selectedAgent.id, formData);

      if (response.success) {
        setSuccessMessage("Agent updated successfully");
        setShowEditDialog(false);
        setSelectedAgent(null);
        fetchAgents();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to update agent");
      }
    } catch (err: any) {
      console.error("Error updating agent:", err);
      setError(err.message || "Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      setSaving(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const response = await bolnaApi.deleteAgent(accessToken, selectedAgent.id);

      if (response.success) {
        setSuccessMessage("Agent deleted successfully");
        setShowDeleteDialog(false);
        setSelectedAgent(null);
        fetchAgents();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to delete agent");
      }
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      setError(err.message || "Failed to delete agent");
    } finally {
      setSaving(false);
    }
  };

  const handleMakeCall = async () => {
    if (!selectedAgent || !phoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Invalid phone number. Use E.164 format (e.g., +919876543210)");
      return;
    }

    try {
      setCalling(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const response = await bolnaApi.makeCall(accessToken, {
        agentId: selectedAgent.id,
        recipientPhone: phoneNumber,
      });

      if (response.success) {
        setSuccessMessage("Call initiated successfully");
        setShowCallDialog(false);
        setPhoneNumber("");
        setSelectedAgent(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to make call");
      }
    } catch (err: any) {
      console.error("Error making call:", err);
      setError(err.message || "Failed to make call");
    } finally {
      setCalling(false);
    }
  };

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      welcomeMessage: agent.welcomeMessage,
      instructions: agent.instructions,
      language: agent.language,
    });
    setShowEditDialog(true);
  };

  const openCallDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setPhoneNumber("");
    setShowCallDialog(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-rose-600" />
            Voice Agents
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage AI voice agents for automated calls
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", welcomeMessage: "", instructions: "", language: "en" });
            setShowCreateDialog(true);
          }}
          className="bg-rose-600 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
            Dismiss
          </Button>
        </div>
      )}

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Voice Agents Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first voice agent to start making automated calls
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Agent
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-rose-100">
                      <Bot className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {LANGUAGES.find((l) => l.value === agent.language)?.label || agent.language}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={agent.isActive ? "default" : "secondary"}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.welcomeMessage}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneCall className="h-4 w-4" />
                  <span>{agent.callCount} calls made</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCallDialog(agent)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(agent)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Link to Call History */}
      {agents.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-5 w-5 text-rose-600" />
              <div>
                <p className="font-medium">View Call History</p>
                <p className="text-sm text-muted-foreground">
                  See all calls made by your voice agents
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard/org/call-history")}
            >
              View History
            </Button>
          </div>
        </Card>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Voice Agent</DialogTitle>
            <DialogDescription>
              Configure your AI voice agent for automated calls
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Appointment Reminder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message *</Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                placeholder="Hello! This is a reminder about your upcoming appointment..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Agent Instructions *</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="You are a friendly appointment reminder assistant. Confirm the appointment details and ask if they need to reschedule..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Describe how the agent should behave and what it should say
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={saving}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Voice Agent</DialogTitle>
            <DialogDescription>Update your voice agent configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Agent Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-welcomeMessage">Welcome Message *</Label>
              <Textarea
                id="edit-welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Agent Instructions *</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAgent}
              disabled={saving}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedAgent?.name}&quot;? This action cannot
              be undone and will also delete all associated call history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Make Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Call</DialogTitle>
            <DialogDescription>
              Use &quot;{selectedAgent?.name}&quot; to call a phone number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
              />
              <p className="text-xs text-muted-foreground">
                Use E.164 format with country code (e.g., +91 for India)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMakeCall}
              disabled={calling || !phoneNumber}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {calling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Phone className="h-4 w-4 mr-2" />
              )}
              Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
