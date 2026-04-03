import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, Loader2, IndianRupee, TrendingUp, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

export default function Wallet() {
    const { user, updateUser } = useAuth();
    const [balance, setBalance] = useState(user?.walletBalance || 0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const { data } = await api.get('/wallet');
            setBalance(data.data.balance);
            setTransactions(data.data.transactions);
        } catch (error) {
            console.error('Failed to fetch wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async () => {
        const amount = Number(addAmount);
        if (!amount || amount < 1) {
            return toast.error('Enter a valid amount');
        }
        if (amount > 50000) {
            return toast.error('Maximum ₹50,000 per transaction');
        }

        setAdding(true);
        try {
            const { data } = await api.post('/wallet/add-money', { amount });

            // Open Razorpay
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'eVEStro',
                description: `Add ₹${amount} to Wallet`,
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        const verifyData = await api.post('/wallet/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success(`₹${amount} added to wallet! 🎉`);
                        setBalance(verifyData.data.data.balance);
                        updateUser({ ...user, walletBalance: verifyData.data.data.balance });
                        setAddAmount('');
                        fetchWallet();
                    } catch (err) {
                        toast.error('Verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone || '',
                },
                theme: { color: '#6366f1' },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', () => toast.error('Payment failed'));
            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setAdding(false);
        }
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="section-heading mb-2">My <span className="gradient-text">Wallet</span></h1>
                <p className="text-campus-muted">Add money and pay for events instantly.</p>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl p-8 mb-8" style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <WalletIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-campus-muted">Available Balance</p>
                            <p className="text-4xl md:text-5xl font-bold font-display">
                                ₹{balance.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Money Section */}
            <div className="glass-card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-400" /> Add Money
                </h2>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                    {QUICK_AMOUNTS.map((amt) => (
                        <button
                            key={amt}
                            onClick={() => setAddAmount(String(amt))}
                            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                Number(addAmount) === amt
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-campus-dark border border-campus-border hover:border-primary-500/50 text-campus-muted hover:text-white'
                            }`}
                        >
                            ₹{amt.toLocaleString('en-IN')}
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-campus-muted" />
                        <input
                            type="number"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="input-field pl-10"
                            min="1"
                            max="50000"
                        />
                    </div>
                    <button
                        onClick={handleAddMoney}
                        disabled={adding || !addAmount || Number(addAmount) < 1}
                        className="btn-primary px-8 flex items-center gap-2"
                    >
                        {adding ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-5 h-5" /> Add
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary-400" /> Transaction History
                </h2>

                {transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <TrendingUp className="w-12 h-12 text-campus-muted/30 mx-auto mb-3" />
                        <p className="text-campus-muted">No transactions yet</p>
                        <p className="text-sm text-campus-muted/60">Add money to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((txn) => (
                            <div
                                key={txn._id}
                                className="flex items-center justify-between p-4 rounded-xl bg-campus-dark/50 border border-campus-border/30 hover:border-campus-border/60 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        txn.type === 'credit'
                                            ? 'bg-green-500/10'
                                            : 'bg-red-500/10'
                                    }`}>
                                        {txn.type === 'credit' ? (
                                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{txn.description}</p>
                                        <p className="text-xs text-campus-muted">{formatDateTime(txn.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        txn.type === 'credit' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs text-campus-muted">Bal: ₹{txn.balanceAfter.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
