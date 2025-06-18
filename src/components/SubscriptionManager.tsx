import { useState, useEffect } from 'react';
import subscriptionApi, { Subscription } from '@/services/subscriptionApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface SubscriptionManagerProps {
  userId: string;
}

const SubscriptionManager = ({ userId }: SubscriptionManagerProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    planName: '',
    plan: 'BASIC' as 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE',
    price: 0,
    currency: 'USD',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
    features: '',
    autoRenew: true
  });
  const { toast } = useToast();

  const planTypes = [
    { value: 'FREE', label: 'Free', color: 'bg-gray-100 text-gray-800' },
    //{ value: 'BASIC', label: 'Basic', color: 'bg-blue-100 text-blue-800' },
    { value: 'PREMIUM', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
   // { value: 'ENTERPRISE', label: 'Enterprise', color: 'bg-gold-100 text-gold-800' }
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getSubscriptions();

      // Ensure all subscriptions have valid data with defaults
      const validatedSubscriptions = (data.content || []).map(subscription => ({
        ...subscription,
        price: subscription.price || 0,
        currency: subscription.currency || 'USD',
        features: subscription.features || [],
        billingCycle: subscription.billingCycle || 'MONTHLY',
        status: subscription.status || 'PENDING'
      }));

      setSubscriptions(validatedSubscriptions);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0);

      await subscriptionApi.createSubscription({
        ...formData,
        userId,
        features: featuresArray,
        status: 'ACTIVE'
      });

      await fetchSubscriptions();
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Success",
        description: "Subscription created successfully!",
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f.length > 0);

      await subscriptionApi.updateSubscription(editingSubscription.id, {
        ...formData,
        features: featuresArray
      });

      await fetchSubscriptions();
      setEditingSubscription(null);
      resetForm();
      toast({
        title: "Success",
        description: "Subscription updated successfully!",
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      await subscriptionApi.deleteSubscription(id);

      await fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscription deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await subscriptionApi.cancelSubscription(id);

      await fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscription cancelled successfully!",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRenewSubscription = async (id: string) => {
    try {
      await subscriptionApi.renewSubscription(id);

      await fetchSubscriptions();
      toast({
        title: "Success",
        description: "Subscription renewed successfully!",
      });
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to renew subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      planName: '',
      plan: 'BASIC',
      price: 0,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      features: '',
      autoRenew: true
    });
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      planName: subscription.planName,
      plan: subscription.plan,
      price: subscription.price,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      features: (subscription.features || []).join(', '),
      autoRenew: subscription.autoRenew
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'INACTIVE': return XCircle;
      case 'CANCELLED': return XCircle;
      case 'EXPIRED': return AlertTriangle;
      case 'PENDING': return Clock;
      default: return Clock;
    }
  };

  const getPlanTypeColor = (planType: string) => {
    const plan = planTypes.find(p => p.value === planType);
    return plan?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number, currency?: string) => {
    // Validate currency code and provide fallback
    const validCurrency = currency && currency.length === 3 ? currency.toUpperCase() : 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency
      }).format(price || 0);
    } catch (error) {
      // Fallback if currency is still invalid
      console.warn(`Invalid currency code: ${currency}, using USD as fallback`);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price || 0);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscriptions...</div>;
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Subscription & Billing</span>
            </CardTitle>
            <CardDescription>Manage your subscription plans and billing</CardDescription>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subscription</DialogTitle>
                <DialogDescription>Set up a new subscription plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Plan Name</label>
                  <Input
                    placeholder="Premium Plan"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan Type</label>
                    <Select value={formData.plan} onValueChange={(value: any) => setFormData({ ...formData, plan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                    <Select value={formData.billingCycle} onValueChange={(value: any) => setFormData({ ...formData, billingCycle: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="99.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Currency</label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Features (comma-separated)</label>
                  <Textarea
                    placeholder="Advanced Analytics, Priority Support, Custom Integrations"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
                  />
                  <label className="text-sm font-medium">Auto-renew subscription</label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateSubscription} className="flex-1">Create Subscription</Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscriptions.map((subscription) => {
          const StatusIcon = getStatusIcon(subscription.status);
          return (
            <div key={subscription.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Crown className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.planName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`rounded-full ${getPlanTypeColor(subscription.plan)}`}>
                        {subscription.plan}
                      </Badge>
                      <Badge className={`rounded-full ${getStatusColor(subscription.status)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatPrice(subscription.price || 0, subscription.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    per {(subscription.billingCycle || 'monthly').toLowerCase()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{formatDate(subscription.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{subscription.paymentMethod || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auto Renew</p>
                  <p className="font-medium">{subscription.autoRenew ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              {subscription.features && subscription.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Features</p>
                  <div className="flex flex-wrap gap-1">
                    {subscription.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex space-x-2">
                {subscription.status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelSubscription(subscription.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                )}
                
                {(subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRenewSubscription(subscription.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Renew
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(subscription)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteSubscription(subscription.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {subscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No subscriptions found.</p>
            <p className="text-sm">Create your first subscription to get started.</p>
          </div>
        )}

        {/* Edit Subscription Modal */}
        {editingSubscription && (
          <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subscription</DialogTitle>
                <DialogDescription>Modify subscription details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Plan Name</label>
                  <Input
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan Type</label>
                    <Select value={formData.plan} onValueChange={(value: any) => setFormData({ ...formData, plan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                    <Select value={formData.billingCycle} onValueChange={(value: any) => setFormData({ ...formData, billingCycle: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Currency</label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Features (comma-separated)</label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
                  />
                  <label className="text-sm font-medium">Auto-renew subscription</label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateSubscription} className="flex-1">Update Subscription</Button>
                  <Button variant="outline" onClick={() => setEditingSubscription(null)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
