import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, ChevronDown, Navigation, UserCheck, Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch?: (filters: any) => void;
}

const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [entity, setEntity] = useState(searchParams.get('entity') || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");
  const [cities, setCities] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(searchParams.getAll('service'));
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(searchParams.get('available') === 'true');
  const [showAvailabilityFilter, setShowAvailabilityFilter] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(searchParams.get('verified') === 'true');
  const [showVerifiedFilter, setShowVerifiedFilter] = useState(false);

  useEffect(() => {
    fetchServiceCategories();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('show_availability_filter, show_verified_filter')
      .single();
    
    if (data) {
      setShowAvailabilityFilter(data.show_availability_filter || false);
      setShowVerifiedFilter(data.show_verified_filter || false);
    }
  };

  useEffect(() => {
    if (entity && entity !== 'all') {
      fetchCities(entity);
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [entity]);

  const fetchServiceCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    
    if (data) {
      const mainCategories = data.filter(cat => !cat.parent_id);
      const withSubcategories = mainCategories.map(main => ({
        ...main,
        subcategories: data.filter(cat => cat.parent_id === main.id)
      }));
      setServiceCategories(withSubcategories);
    }
  };

  const fetchCities = async (entityCode: string) => {
    if (!entityCode || entityCode === 'all') return;
    
    const { data: entityData } = await supabase
      .from('entities')
      .select('id')
      .eq('code', entityCode as 'fbih' | 'rs' | 'brcko')
      .single();
    
    if (entityData) {
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .eq('entity_id', entityData.id)
        .order('name');
      
      if (citiesData) {
        setCities(citiesData);
      }
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSearch = () => {
    const filters = {
      searchTerm,
      entity,
      city: selectedCity,
      services: selectedServices,
      onlyAvailable,
      onlyVerified,
    };

    // If onSearch is provided, call it (for Search page)
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search page with query params (for Index page)
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (entity && entity !== 'all') params.set('entity', entity);
      if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
      selectedServices.forEach(service => params.append('service', service));
      if (onlyAvailable) params.set('available', 'true');
      if (onlyVerified) params.set('verified', 'true');
      
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Greška",
        description: "Vaš pretraživač ne podržava geolokaciju",
        variant: "destructive",
      });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const filters = {
          searchTerm,
          entity,
          city: selectedCity,
          services: selectedServices,
          onlyAvailable,
          onlyVerified,
          nearMe: true,
          userLat: latitude,
          userLng: longitude,
        };

        if (onSearch) {
          onSearch(filters);
        } else {
          const params = new URLSearchParams();
          if (searchTerm) params.set('q', searchTerm);
          if (entity && entity !== 'all') params.set('entity', entity);
          if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
          selectedServices.forEach(service => params.append('service', service));
          if (onlyAvailable) params.set('available', 'true');
          if (onlyVerified) params.set('verified', 'true');
          params.set('nearMe', 'true');
          params.set('userLat', latitude.toString());
          params.set('userLng', longitude.toString());
          
          navigate(`/search?${params.toString()}`);
        }

        setLoadingLocation(false);
        toast({
          title: "Lokacija pronađena",
          description: "Prikazujem profile u vašoj blizini",
        });
      },
      (error) => {
        setLoadingLocation(false);
        toast({
          title: "Greška",
          description: "Nije moguće pristupiti vašoj lokaciji",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži po imenu ili nazivu firme..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {/* Service Categories Filter */}
      <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Usluge {selectedServices.length > 0 && `(${selectedServices.length})`}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="border rounded-lg p-4 bg-muted/50 max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {serviceCategories.map((mainCategory) => (
                <div key={mainCategory.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={mainCategory.id}
                      checked={selectedServices.includes(mainCategory.id)}
                      onCheckedChange={() => handleServiceToggle(mainCategory.id)}
                    />
                    <Label htmlFor={mainCategory.id} className="font-semibold cursor-pointer">
                      {mainCategory.name}
                    </Label>
                  </div>
                  {mainCategory.subcategories?.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {mainCategory.subcategories.map((sub: any) => (
                        <div key={sub.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={sub.id}
                            checked={selectedServices.includes(sub.id)}
                            onCheckedChange={() => handleServiceToggle(sub.id)}
                          />
                          <Label htmlFor={sub.id} className="text-sm cursor-pointer">
                            {sub.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Entity and City Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="flex-1">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Entitet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi entiteti</SelectItem>
            <SelectItem value="fbih">Federacija BiH</SelectItem>
            <SelectItem value="rs">Republika Srpska</SelectItem>
            <SelectItem value="brcko">Brčko Distrikt</SelectItem>
          </SelectContent>
        </Select>

        {/* City Filter - Shows when entity is selected */}
        {entity && entity !== 'all' && cities.length > 0 && (
          <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={citySearchOpen}
                className="flex-1 justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedCity && selectedCity !== "all"
                      ? cities.find((city) => city.id === selectedCity)?.name
                      : "Grad"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Pretraži grad ili poštanski broj..." />
                <CommandList>
                  <CommandEmpty>Grad nije pronađen.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedCity("all");
                        setCitySearchOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity === "all" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Svi gradovi
                    </CommandItem>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={`${city.name} ${city.postal_code}`}
                        onSelect={() => {
                          setSelectedCity(city.id);
                          setCitySearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity === city.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city.name} ({city.postal_code})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Availability Filter - Only shown if enabled by admin */}
      {showAvailabilityFilter && (
        <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
          <Checkbox
            id="only-available"
            checked={onlyAvailable}
            onCheckedChange={(checked) => setOnlyAvailable(checked as boolean)}
          />
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <Label htmlFor="only-available" className="cursor-pointer font-medium text-sm">
              Samo dostupni za nove klijente
            </Label>
          </div>
        </div>
      )}

      {/* Verified Filter - Only shown if enabled by admin */}
      {showVerifiedFilter && (
        <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
          <Checkbox
            id="only-verified"
            checked={onlyVerified}
            onCheckedChange={(checked) => setOnlyVerified(checked as boolean)}
          />
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <Label htmlFor="only-verified" className="cursor-pointer font-medium text-sm">
              Samo verifikovani profesionalci
            </Label>
          </div>
        </div>
      )}

      {/* Near Me Button */}
      <Button 
        onClick={handleNearMe} 
        variant="outline" 
        className="w-full"
        disabled={loadingLocation}
      >
        <Navigation className="h-4 w-4 mr-2" />
        {loadingLocation ? "Pronalaženje lokacije..." : "Prikaži blizu mene"}
      </Button>

      {/* Search Button */}
      <Button onClick={handleSearch} size="lg" className="w-full bg-hero-gradient">
        <Search className="h-4 w-4 mr-2" />
        Pretraži
      </Button>
    </div>
  );
};

export default SearchFilters;
