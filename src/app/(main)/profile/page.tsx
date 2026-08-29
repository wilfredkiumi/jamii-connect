'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Users,
  Star,
  MessageCircle,
  ExternalLink,
  Award,
  Globe,
  Heart,
  Target,
  Settings,
  Camera,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUserProfile, updateUserProfile } from '@/lib/api/client'
import type { ProfileWithStats as Profile } from '@/types/database'

// The schema stores a single nullable full_name and a heritage_countries array;
// the UI presents a display name and a primary heritage country.
const displayName = (p: Profile) => p.full_name ?? 'Your profile'
const initials = (p: Profile) =>
  displayName(p).split(' ').map((n) => n[0]).slice(0, 2).join('')
const heritage = (p: Profile) => p.heritage_countries?.[0] ?? null

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await getUserProfile<Profile>()

      if (error || !data) {
        toast.error('Please log in to view your profile')
        setProfile(null)
        return
      }

      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Only allowlisted columns are accepted by PATCH /api/profile; anything
      // else in this object is ignored server-side.
      const updateData = {
        full_name: editedProfile.full_name,
        bio: editedProfile.bio,
        location: editedProfile.location,
        country: editedProfile.country,
        heritage_countries: editedProfile.heritage_countries,
        profession: editedProfile.profession,
        company: editedProfile.company,
        education: editedProfile.education,
        skills: editedProfile.skills,
        languages: editedProfile.languages,
        interests: editedProfile.interests,
        linkedin_url: editedProfile.linkedin_url,
        twitter_url: editedProfile.twitter_url,
        website_url: editedProfile.website_url,
        is_mentor: editedProfile.is_mentor,
        is_seeking_mentorship: editedProfile.is_seeking_mentorship,
        whatsapp_number: editedProfile.whatsapp_number,
      }

      const { data: saved, error } = await updateUserProfile<Profile>(updateData)
      if (error) throw error
      if (saved) setProfile(saved)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setEditing(false)
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !editedProfile.skills?.includes(skill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...(editedProfile.skills || []), skill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills?.filter(skill => skill !== skillToRemove) || []
    })
  }

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan',
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Sweden'
  ]

  const heritageCountries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia'
  ]

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Kenya': '🇰🇪', 'Uganda': '🇺🇬', 'Tanzania': '🇹🇿', 'Rwanda': '🇷🇼', 'Burundi': '🇧🇮',
      'South Sudan': '🇸🇸', 'Ethiopia': '🇪🇹', 'Somalia': '🇸🇴',
      'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪'
    }
    return countryFlags[country] || '🌍'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-[var(--clay-200)] rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-[var(--clay-200)] rounded w-48"></div>
              <div className="h-4 bg-[var(--clay-200)] rounded w-32"></div>
            </div>
          </div>
          <div className="h-96 bg-[var(--clay-200)] rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-display text-2xl font-bold text-foreground mb-4">Profile not found</h1>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-[var(--terracotta)]/20">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName(profile)} />
                  <AvatarFallback className="text-2xl bg-[var(--terracotta)] text-white">
                    {initials(profile)}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <Button
                    size="sm" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)]"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-display text-3xl font-bold text-foreground">{displayName(profile)}</h1>
                  {profile.is_verified && (
                    <Shield className="h-6 w-6 text-[var(--terracotta)]" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.profession}</span>
                  {profile.company && (
                    <>
                      <span>at</span>
                      <span className="font-medium text-[var(--terracotta)]">{profile.company}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                  <span>{getCountryFlag(profile.country || '')}</span>
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}, {profile.country}</span>
                </div>
                {heritage(profile) && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-muted-foreground">Heritage:</span>
                    <span className="text-sm font-medium">
                      {getCountryFlag(heritage(profile))} {heritage(profile)}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile.is_mentor && (
                <Badge className="bg-[var(--terracotta)] text-white flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Mentor</span>
                </Badge>
              )}
              {profile.is_seeking_mentorship && (
                <Badge variant="outline" className="border-blue-500 text-[var(--terracotta)]">
                  <Target className="h-3 w-3 mr-1" />
                  Seeking Mentorship
                </Badge>
              )}
              <Button
                onClick={() => setEditing(!editing)}
                variant={editing ? "outline" : "default"}
                className={editing ? "" : "bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"}
              >
                {editing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {editing && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="connections">Network</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-[var(--clay-600)]">{profile.bio}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={profile.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  {editing ? (
                    <Input
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      placeholder="City"
                    />
                  ) : (
                    <Input value={profile.location ?? ''} disabled />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  {editing ? (
                    <Select
                      value={editedProfile.country || ''}
                      onValueChange={(value) => setEditedProfile({ ...editedProfile, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {getCountryFlag(country)} {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.country ?? ''} disabled />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {editing ? (
                    <>
                      <Input
                        placeholder="LinkedIn URL"
                        value={editedProfile.linkedin_url || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })}
                      />
                      <Input
                        placeholder="Twitter URL"
                        value={editedProfile.twitter_url || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, twitter_url: e.target.value })}
                      />
                      <Input
                        placeholder="Website URL"
                        value={editedProfile.website_url || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, website_url: e.target.value })}
                      />
                    </>
                  ) : (
                    <>
                      {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[var(--terracotta)] hover:underline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      )}
                      {profile.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[var(--terracotta)] hover:underline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      )}
                      {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[var(--terracotta)] hover:underline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Position</label>
                {editing ? (
                  <Input
                    value={editedProfile.profession || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, profession: e.target.value })}
                    placeholder="Your job title"
                  />
                ) : (
                  <Input value={profile.profession ?? ''} disabled />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                {editing ? (
                  <Input
                    value={editedProfile.company || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                    placeholder="Your company"
                  />
                ) : (
                  <Input value={profile.company ?? ''} disabled />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Input
                  value={editedProfile.education || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, education: e.target.value })}
                  placeholder="Your education background"
                />
              ) : (
                <p className="text-[var(--clay-600)]">{profile.education}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(editing ? editedProfile.skills : profile.skills)?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {skill}
                    {editing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addSkill(input.value)
                      input.value = ''
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map((language, index) => (
                  <Badge key={index} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Available as Mentor</h3>
                  <p className="text-sm text-[var(--clay-500)]">Help others in the diaspora community</p>
                </div>
                <Badge className={profile.is_mentor ? "bg-[var(--terracotta)] text-white" : "bg-[var(--clay-200)] text-[var(--clay-600)]"}>
                  {profile.is_mentor ? "Active Mentor" : "Not Available"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Seeking Mentorship</h3>
                  <p className="text-sm text-[var(--clay-500)]">Looking for guidance and support</p>
                </div>
                <Badge className={profile.is_seeking_mentorship ? "bg-[var(--indigo)] text-white" : "bg-[var(--clay-200)] text-[var(--clay-600)]"}>
                  {profile.is_seeking_mentorship ? "Seeking" : "Not Seeking"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[var(--terracotta)]">156</div>
                  <div className="text-sm text-[var(--clay-500)]">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--terracotta)]">23</div>
                  <div className="text-sm text-[var(--clay-500)]">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-[var(--clay-500)]">Events Attended</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-[var(--clay-500)]">Months Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Public Profile</h3>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other community members</p>
                </div>
                <Switch
                  checked={editing ? editedProfile.is_public_profile : profile.is_public_profile}
                  onCheckedChange={(checked) => editing && setEditedProfile({ ...editedProfile, is_public_profile: checked })}
                  disabled={!editing}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Available as Mentor</h3>
                  <p className="text-sm text-muted-foreground">Allow other members to request mentorship from you</p>
                </div>
                <Switch
                  checked={editing ? editedProfile.is_mentor : profile.is_mentor}
                  onCheckedChange={(checked) => editing && setEditedProfile({ ...editedProfile, is_mentor: checked })}
                  disabled={!editing}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Seeking Mentorship</h3>
                  <p className="text-sm text-muted-foreground">Let mentors know you&apos;re looking for guidance</p>
                </div>
                <Switch
                  checked={editing ? editedProfile.is_seeking_mentorship : profile.is_seeking_mentorship}
                  onCheckedChange={(checked) => editing && setEditedProfile({ ...editedProfile, is_seeking_mentorship: checked })}
                  disabled={!editing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Community Engagement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-lg bg-[var(--terracotta)]/10">
                  <Users className="h-6 w-6 mx-auto mb-2 text-[var(--terracotta)]" />
                  <div className="text-2xl font-bold text-[var(--terracotta)]">{profile.connection_count}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <MessageCircle className="h-6 w-6 mx-auto mb-2 text-[var(--terracotta)]" />
                  <div className="text-2xl font-bold text-[var(--terracotta)]">{profile.posts_count}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{profile.events_attended}</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50">
                  <Award className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </div>
                  <div className="text-sm text-muted-foreground">Months</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
