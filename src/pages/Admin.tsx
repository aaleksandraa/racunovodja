import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Users, MapPin, Briefcase, Loader2, Settings, Upload, FileText, GripVertical } from "lucide-react";
import { CSVImport } from "@/components/admin/CSVImport";
import { GASettings } from "@/components/admin/GASettings";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { SortableServiceItem } from "@/components/admin/SortableServiceItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [cantons, setCantons] = useState<any[]>([]);
  
  // Form states
  const [newCity, setNewCity] = useState({ name: '', postal_code: '', entity_id: '', canton_id: '' });
  const [newEntity, setNewEntity] = useState({ name: '', code: '' });
  const [newCanton, setNewCanton] = useState({ name: '', entity_id: '' });
  const [newService, setNewService] = useState({ name: '', description: '', parent_id: '' });
  const [editingService, setEditingService] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // SECURITY: Using is_admin_secure() RPC which uses auth.uid() internally
    // This prevents attackers from spoofing admin status
    const { data: isAdminResult, error } = await supabase.rpc('is_admin_secure');

    if (error || !isAdminResult) {
      toast.error("Nemate pristup admin panelu");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    // Fetch profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profilesData) setProfiles(profilesData);

    // Fetch entities
    const { data: entitiesData } = await supabase
      .from('entities')
      .select('*')
      .order('name');
    if (entitiesData) setEntities(entitiesData);

    // Fetch cantons
    const { data: cantonsData } = await supabase
      .from('cantons')
      .select('*, entities(name)')
      .order('name');
    if (cantonsData) setCantons(cantonsData);

    // Fetch cities
    const { data: citiesData } = await supabase
      .from('cities')
      .select('*, entities(name), cantons(name)')
      .order('name');
    if (citiesData) setCities(citiesData);

    // Fetch service categories
    const { data: categoriesData } = await supabase
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    if (categoriesData) setServiceCategories(categoriesData);
  };

  const handleToggleUserActive = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Find the profile to get email and name
    const profile = profiles.find(p => p.id === userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (error) {
      toast.error("Greška pri ažuriranju");
    } else {
      toast.success("Korisnik uspješno ažuriran");
      
      // Send email notification if profile was activated (approved)
      if (newStatus && profile) {
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              email: profile.email,
              name: `${profile.first_name} ${profile.last_name}`,
              type: 'profile_approved'
            }
          });
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }
      
      fetchData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Da li ste sigurni da želite obrisati ovog korisnika?")) return;

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      toast.error("Greška pri brisanju");
    } else {
      toast.success("Korisnik uspješno obrisan");
      fetchData();
    }
  };

  // Entity Management
  const handleAddEntity = async () => {
    if (!newEntity.name || !newEntity.code) {
      toast.error("Unesite sve podatke");
      return;
    }

    const { error } = await supabase
      .from('entities')
      .insert([{ name: newEntity.name, code: newEntity.code as 'fbih' | 'rs' | 'brcko' }]);

    if (error) {
      toast.error("Greška pri dodavanju");
    } else {
      toast.success("Entitet uspješno dodat");
      setNewEntity({ name: '', code: '' });
      fetchData();
    }
  };

  // Canton Management
  const handleAddCanton = async () => {
    if (!newCanton.name || !newCanton.entity_id) {
      toast.error("Unesite sve podatke");
      return;
    }

    const { error } = await supabase
      .from('cantons')
      .insert([{ name: newCanton.name, entity_id: newCanton.entity_id }]);

    if (error) {
      toast.error("Greška pri dodavanju");
    } else {
      toast.success("Kanton uspješno dodat");
      setNewCanton({ name: '', entity_id: '' });
      fetchData();
    }
  };

  // City Management
  const handleAddCity = async () => {
    if (!newCity.name || !newCity.postal_code || !newCity.entity_id) {
      toast.error("Unesite sve podatke");
      return;
    }

    const { error } = await supabase
      .from('cities')
      .insert([{
        name: newCity.name,
        postal_code: newCity.postal_code,
        entity_id: newCity.entity_id,
        canton_id: newCity.canton_id || null
      }]);

    if (error) {
      toast.error("Greška pri dodavanju");
    } else {
      toast.success("Grad uspješno dodat");
      setNewCity({ name: '', postal_code: '', entity_id: '', canton_id: '' });
      fetchData();
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm("Da li ste sigurni?")) return;

    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', cityId);

    if (error) {
      toast.error("Greška pri brisanju");
    } else {
      toast.success("Grad uspješno obrisan");
      fetchData();
    }
  };

  // Service Category Management
  const handleAddService = async () => {
    if (!newService.name) {
      toast.error("Unesite naziv usluge");
      return;
    }

    // Calculate the next display_order value
    const siblingCategories = newService.parent_id
      ? serviceCategories.filter(s => s.parent_id === newService.parent_id)
      : serviceCategories.filter(s => !s.parent_id);
    
    const maxDisplayOrder = siblingCategories.reduce((max, cat) => 
      Math.max(max, cat.display_order || 0), 0
    );

    const { error } = await supabase
      .from('service_categories')
      .insert([{
        name: newService.name,
        description: newService.description,
        parent_id: newService.parent_id || null,
        display_order: maxDisplayOrder + 1
      }]);

    if (error) {
      toast.error("Greška pri dodavanju");
    } else {
      toast.success("Kategorija uspješno dodana");
      setNewService({ name: '', description: '', parent_id: '' });
      fetchData();
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.name) {
      toast.error("Unesite naziv usluge");
      return;
    }

    const { error } = await supabase
      .from('service_categories')
      .update({
        name: editingService.name,
        description: editingService.description
      })
      .eq('id', editingService.id);

    if (error) {
      toast.error("Greška pri ažuriranju");
    } else {
      toast.success("Kategorija uspješno ažurirana");
      setEditingService(null);
      fetchData();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Da li ste sigurni? Ovo će obrisati i sve podkategorije.")) return;

    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', serviceId);

    if (error) {
      toast.error("Greška pri brisanju");
    } else {
      toast.success("Kategorija uspješno obrisana");
      fetchData();
    }
  };

  const handleDragEnd = async (event: DragEndEvent, parentId: string | null = null) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const categories = parentId 
      ? serviceCategories.filter(s => s.parent_id === parentId)
      : serviceCategories.filter(s => !s.parent_id);

    const oldIndex = categories.findIndex(cat => cat.id === active.id);
    const newIndex = categories.findIndex(cat => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCategories = arrayMove(categories, oldIndex, newIndex);

    // Update display_order for all affected categories
    const updates = reorderedCategories.map((cat, index) => ({
      id: cat.id,
      display_order: index + 1
    }));

    // Optimistically update UI
    const newServiceCategories = serviceCategories.map(cat => {
      const update = updates.find(u => u.id === cat.id);
      return update ? { ...cat, display_order: update.display_order } : cat;
    });
    setServiceCategories(newServiceCategories);

    // Save to database
    try {
      for (const update of updates) {
        await supabase
          .from('service_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      toast.success("Redoslijed uspješno sačuvan");
    } catch (error) {
      toast.error("Greška pri čuvanju redoslijeda");
      fetchData(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Upravljajte sadržajem i korisnicima platforme
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-8 max-w-5xl">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Korisnici
            </TabsTrigger>
            <TabsTrigger value="licenses">
              Licence
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Lokacije
            </TabsTrigger>
            <TabsTrigger value="services">
              <Briefcase className="h-4 w-4 mr-2" />
              Usluge
            </TabsTrigger>
            <TabsTrigger value="entities">
              Entiteti
            </TabsTrigger>
            <TabsTrigger value="blog">
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Postavke
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Korisnici</CardTitle>
                <CardDescription>
                  Upravljajte korisnicima i njihovim profilima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {profile.company_name || `${profile.first_name} ${profile.last_name}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${profile.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {profile.is_active ? 'Aktivan' : 'Neaktivan'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${profile.registration_completed ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                            {profile.registration_completed ? 'Profil potpun' : 'Profil nepotpun'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={profile.is_active ? "destructive" : "default"}
                          onClick={() => handleToggleUserActive(profile.id, profile.is_active)}
                        >
                          {profile.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verifikacija licenci</CardTitle>
                <CardDescription>
                  Pregledajte i verifikujte licence profesionalaca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles
                    .filter(profile => profile.license_type && profile.license_number)
                    .map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {profile.company_name || `${profile.first_name} ${profile.last_name}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          <div className="flex flex-col gap-1 mt-2">
                            <span className="text-sm">
                              <strong>Tip licence:</strong> {profile.license_type === 'certified_accountant' ? 'Certifikovani računovođa' : 'Certifikovani računovodstveni tehničar'}
                            </span>
                            <span className="text-sm">
                              <strong>Broj licence:</strong> {profile.license_number}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded w-fit mt-1 ${profile.is_license_verified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                              {profile.is_license_verified ? 'Licenca verifikovana' : 'Licenca nije verifikovana'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={profile.is_license_verified ? "outline" : "default"}
                            onClick={async () => {
                              const newVerifiedStatus = !profile.is_license_verified;
                              
                              const { error } = await supabase
                                .from('profiles')
                                .update({ is_license_verified: newVerifiedStatus })
                                .eq('id', profile.id);
                                
                              if (error) {
                                toast.error("Greška pri ažuriranju");
                              } else {
                                toast.success(profile.is_license_verified ? "Licenca deaktivirana" : "Licenca verifikovana");
                                
                                // Send email notification if license was verified
                                if (newVerifiedStatus) {
                                  try {
                                    await supabase.functions.invoke('send-notification-email', {
                                      body: {
                                        email: profile.email,
                                        name: `${profile.first_name} ${profile.last_name}`,
                                        type: 'license_verified'
                                      }
                                    });
                                  } catch (emailError) {
                                    console.error('Failed to send email:', emailError);
                                  }
                                }
                                
                                fetchData();
                              }
                            }}
                          >
                            {profile.is_license_verified ? 'Ukloni verifikaciju' : 'Verifikuj licencu'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  {profiles.filter(p => p.license_type && p.license_number).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nema profesionalaca sa licencama
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            {/* Add City Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dodaj novi grad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Naziv grada</Label>
                    <Input
                      value={newCity.name}
                      onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                      placeholder="Npr. Sarajevo"
                    />
                  </div>
                  <div>
                    <Label>Poštanski broj</Label>
                    <Input
                      value={newCity.postal_code}
                      onChange={(e) => setNewCity({ ...newCity, postal_code: e.target.value })}
                      placeholder="Npr. 71000"
                    />
                  </div>
                  <div>
                    <Label>Entitet</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newCity.entity_id}
                      onChange={(e) => setNewCity({ ...newCity, entity_id: e.target.value })}
                    >
                      <option value="">Izaberite entitet</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Kanton (opciono)</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newCity.canton_id}
                      onChange={(e) => setNewCity({ ...newCity, canton_id: e.target.value })}
                    >
                      <option value="">Bez kantona</option>
                      {cantons.filter(c => c.entity_id === newCity.entity_id).map((canton) => (
                        <option key={canton.id} value={canton.id}>{canton.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddCity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj grad
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Canton Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dodaj novi kanton</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Naziv kantona</Label>
                    <Input
                      value={newCanton.name}
                      onChange={(e) => setNewCanton({ ...newCanton, name: e.target.value })}
                      placeholder="Npr. Sarajevski kanton"
                    />
                  </div>
                  <div>
                    <Label>Entitet</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newCanton.entity_id}
                      onChange={(e) => setNewCanton({ ...newCanton, entity_id: e.target.value })}
                    >
                      <option value="">Izaberite entitet</option>
                      {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddCanton}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj kanton
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cities List */}
            <Card>
              <CardHeader>
                <CardTitle>Gradovi ({cities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{city.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {city.postal_code} | {city.entities?.name}
                          {city.cantons && ` | ${city.cantons.name}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCity(city.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {/* Add Service Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dodaj novu kategoriju</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Naziv kategorije</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Npr. Knjigovodstvene usluge"
                    />
                  </div>
                  <div>
                    <Label>Opis</Label>
                    <Textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Kratak opis kategorije"
                    />
                  </div>
                  <div>
                    <Label>Nadkategorija (opciono - za podkategorije)</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newService.parent_id}
                      onChange={(e) => setNewService({ ...newService, parent_id: e.target.value })}
                    >
                      <option value="">Glavna kategorija</option>
                      {serviceCategories.filter(s => !s.parent_id).map((service) => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj kategoriju
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services List */}
            <Card>
              <CardHeader>
                <CardTitle>Kategorije usluga ({serviceCategories.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Povucite ikonu sa lijeve strane da promijenite redoslijed
                </p>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, null)}
                >
                  <SortableContext
                    items={serviceCategories.filter(s => !s.parent_id).map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 max-h-96 overflow-y-auto pl-6">
                      {serviceCategories.filter(s => !s.parent_id).map((category) => (
                        <SortableServiceItem key={category.id} id={category.id}>
                          <div className="border rounded">
                            <div className="p-3">
                              {editingService?.id === category.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingService.name}
                                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                  />
                                  <Textarea
                                    value={editingService.description || ''}
                                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleUpdateService}>Sačuvaj</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingService(null)}>Otkaži</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium">{category.name}</p>
                                    {category.description && (
                                      <p className="text-sm text-muted-foreground">{category.description}</p>
                                    )}
                                    {/* Subcategories */}
                                    {serviceCategories.filter(s => s.parent_id === category.id).length > 0 && (
                                      <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(event) => handleDragEnd(event, category.id)}
                                      >
                                        <SortableContext
                                          items={serviceCategories.filter(s => s.parent_id === category.id).map(s => s.id)}
                                          strategy={verticalListSortingStrategy}
                                        >
                                          <div className="mt-2 ml-4 space-y-1 pl-6">
                                            {serviceCategories.filter(s => s.parent_id === category.id).map((sub) => (
                                              <SortableServiceItem key={sub.id} id={sub.id}>
                                                <div className="p-2 bg-muted/50 rounded text-sm">
                                                  {editingService?.id === sub.id ? (
                                                    <div className="space-y-2">
                                                      <Input
                                                        value={editingService.name}
                                                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                                      />
                                                      <Textarea
                                                        value={editingService.description || ''}
                                                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                                      />
                                                      <div className="flex gap-2">
                                                        <Button size="sm" onClick={handleUpdateService}>Sačuvaj</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingService(null)}>Otkaži</Button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center justify-between">
                                                      <span>{sub.name}</span>
                                                      <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingService(sub)}>
                                                          <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteService(sub.id)}>
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </SortableServiceItem>
                                            ))}
                                          </div>
                                        </SortableContext>
                                      </DndContext>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingService(category)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteService(category.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </SortableServiceItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-4">
            {/* Add Entity Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dodaj novi entitet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Naziv entiteta</Label>
                    <Input
                      value={newEntity.name}
                      onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                      placeholder="Npr. Federacija BiH"
                    />
                  </div>
                  <div>
                    <Label>Kod</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newEntity.code}
                      onChange={(e) => setNewEntity({ ...newEntity, code: e.target.value })}
                    >
                      <option value="">Izaberite kod</option>
                      <option value="fbih">fbih</option>
                      <option value="rs">rs</option>
                      <option value="brcko">brcko</option>
                    </select>
                  </div>
                  <Button onClick={handleAddEntity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj entitet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Entities & Cantons List */}
            <Card>
              <CardHeader>
                <CardTitle>Entiteti i Kantoni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entities.map((entity) => (
                    <div key={entity.id} className="border rounded p-3">
                      <p className="font-bold">{entity.name} ({entity.code})</p>
                      <div className="mt-2 ml-4 space-y-1">
                        {cantons.filter(c => c.entity_id === entity.id).map((canton) => (
                          <div key={canton.id} className="text-sm p-2 bg-muted/50 rounded">
                            {canton.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import">
            <CSVImport />
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <GASettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
