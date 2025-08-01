-- Create finance transactions table
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL,
    memo TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finance chat messages table
CREATE TABLE IF NOT EXISTS public.finance_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_id ON public.finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON public.finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_category ON public.finance_transactions(category);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_created_at ON public.finance_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_finance_chat_messages_user_id ON public.finance_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_chat_messages_timestamp ON public.finance_chat_messages(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.finance_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_transactions
CREATE POLICY "Users can view own finance transactions" ON public.finance_transactions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own finance transactions" ON public.finance_transactions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own finance transactions" ON public.finance_transactions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own finance transactions" ON public.finance_transactions
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

-- RLS Policies for finance_chat_messages
CREATE POLICY "Users can view own finance chat messages" ON public.finance_chat_messages
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own finance chat messages" ON public.finance_chat_messages
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own finance chat messages" ON public.finance_chat_messages
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own finance chat messages" ON public.finance_chat_messages
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users WHERE google_id = auth.uid()::text
        )
    );

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_finance_transactions_updated_at ON public.finance_transactions;
CREATE TRIGGER update_finance_transactions_updated_at
    BEFORE UPDATE ON public.finance_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 