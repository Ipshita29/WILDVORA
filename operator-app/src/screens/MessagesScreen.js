import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { inquiryAPI, messageAPI } from '../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - d) / 86400000);
  if (diffDays === 0) return formatTime(dateStr);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

function normaliseInquiry(inq) {
  const msgs = inq.messages || [];
  if (msgs.length === 0) return null;
  const last = msgs[msgs.length - 1];
  return {
    id: inq._id,
    type: 'inquiry',
    customer: inq.customer,
    title: inq.experience?.title || 'Experience',
    lastMsg: { text: last.text, time: last.sentAt, senderRole: last.role },
    updatedAt: last.sentAt,
    _inq: inq,
  };
}

function normaliseBookingThread(t) {
  return {
    id: t._id,
    type: 'booking',
    customer: t.customer,
    title: t.experience?.title || 'Experience',
    lastMsg: { text: t.lastMessage.text, time: t.lastMessage.createdAt, senderRole: t.lastMessage.senderRole },
    updatedAt: t.updatedAt,
  };
}

// ── Conversation view ────────────────────────────────────────────────────────
function ConversationView({ thread, onBack }) {
  const isInquiry = thread.type === 'inquiry';

  const [messages, setMessages] = useState(
    isInquiry
      ? [...(thread._inq?.messages || [])].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
      : []
  );
  const [bMsgsLoading, setBMsgsLoading] = useState(!isInquiry);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const pollRef = useRef(null);

  const fetchBookingMsgs = useCallback(async (silent = false) => {
    if (!silent) setBMsgsLoading(true);
    try {
      const res = await messageAPI.getByBooking(thread.id);
      if (res.data.success) {
        setMessages(
          [...(res.data.messages || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        );
      }
    } catch (_) {}
    finally { if (!silent) setBMsgsLoading(false); }
  }, [thread.id]);

  const fetchInquiryMsgs = useCallback(async () => {
    try {
      const res = await inquiryAPI.getInquiries();
      if (res.data.success) {
        const updated = res.data.inquiries.find(i => i._id === thread.id);
        if (updated) {
          setMessages(
            [...(updated.messages || [])].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
          );
        }
      }
    } catch (_) {}
  }, [thread.id]);

  useEffect(() => {
    if (isInquiry) {
      pollRef.current = setInterval(fetchInquiryMsgs, 5000);
    } else {
      fetchBookingMsgs();
      pollRef.current = setInterval(() => fetchBookingMsgs(true), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [isInquiry, fetchBookingMsgs, fetchInquiryMsgs]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const isOpMsg = (msg) =>
    isInquiry
      ? msg.role === 'operator'
      : (msg.sender?.role === 'operator' || msg.sender?.role === 'admin');

  const msgTime = (msg) => (isInquiry ? msg.sentAt : msg.createdAt);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      if (isInquiry) {
        const res = await inquiryAPI.sendReply(thread.id, msgText);
        if (res.data.success) {
          setMessages(prev => [...prev, res.data.message]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } else {
        const res = await messageAPI.send(thread.id, msgText);
        if (res.data.success) {
          setMessages(prev => [...prev, res.data.message]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send reply. Please try again.');
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isOp = isOpMsg(item);
    return (
      <View style={[s.msgRow, isOp ? s.msgRowOp : s.msgRowGuest]}>
        {!isOp && (
          <View style={s.avatarWrap}>
            <View style={s.avatarBg}>
              <Text style={s.avatarText}>{getInitials(thread.customer?.name)}</Text>
            </View>
          </View>
        )}
        <View style={[s.bubble, isOp ? s.bubbleOp : s.bubbleGuest]}>
          <Text style={[s.msgText, isOp ? s.msgTextOp : s.msgTextGuest]}>{item.text}</Text>
          <Text style={[s.timeText, isOp ? s.timeTextOp : s.timeTextGuest]}>
            {formatTime(msgTime(item))}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerNameRow}>
            <Text style={s.headerName} numberOfLines={1}>{thread.customer?.name || 'Guest'}</Text>
            <View style={[s.typeBadge, isInquiry ? s.typeBadgeEnquiry : s.typeBadgeBooking]}>
              <Text style={[s.typeBadgeText, isInquiry ? s.typeBadgeTextEnquiry : s.typeBadgeTextBooking]}>
                {isInquiry ? 'Enquiry' : 'Confirmed'}
              </Text>
            </View>
          </View>
          <Text style={s.headerExp} numberOfLines={1}>{thread.title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Notice banner for pre-booking enquiries */}
      {isInquiry && (
        <View style={s.noticeBanner}>
          <MaterialCommunityIcons name="lock-outline" size={12} color="#b45309" />
          <Text style={s.noticeText}>
            Pre-booking enquiry — contact details shared after confirmed booking.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {bMsgsLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, i) => item._id ?? String(i)}
            renderItem={renderMessage}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <MaterialCommunityIcons name="chat-outline" size={44} color={theme.outlineVariant} />
                <Text style={s.emptyText}>No messages yet</Text>
              </View>
            }
          />
        )}

        {/* Reply input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="Reply to this guest…"
            placeholderTextColor={theme.textLight}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator color={theme.white} size="small" />
              : <Ionicons name="send" size={16} color={theme.white} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Thread list view ─────────────────────────────────────────────────────────
export default function MessagesScreen() {
  const [threads, setThreads]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]   = useState(null);
  const pollRef                   = useRef(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [iqRes, mtRes] = await Promise.all([
        inquiryAPI.getInquiries(),
        messageAPI.getThreads(),
      ]);

      const iqThreads = (iqRes.data.inquiries || [])
        .map(normaliseInquiry)
        .filter(Boolean);

      const bThreads = (mtRes.data.threads || [])
        .map(normaliseBookingThread);

      const merged = [...iqThreads, ...bThreads]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setThreads(merged);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(() => fetchAll(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  if (selected) {
    return (
      <ConversationView
        thread={selected}
        onBack={() => { setSelected(null); fetchAll(true); }}
      />
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <FlatList
        data={threads}
        keyExtractor={item => `${item.type}-${item.id}`}
        renderItem={({ item }) => {
          const unread = item.lastMsg?.senderRole === 'customer';
          return (
            <TouchableOpacity
              style={s.threadCard}
              onPress={() => setSelected(item)}
              activeOpacity={0.75}
            >
              <View style={s.threadAvatar}>
                <Text style={s.threadAvatarText}>{getInitials(item.customer?.name)}</Text>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={s.threadTopRow}>
                  <Text style={[s.threadName, unread && s.threadNameUnread]} numberOfLines={1}>
                    {item.customer?.name || 'Guest'}
                  </Text>
                  <Text style={s.threadDate}>{formatDate(item.lastMsg?.time)}</Text>
                </View>

                <View style={s.threadMidRow}>
                  <Text style={s.threadExp} numberOfLines={1}>{item.title}</Text>
                  <View style={[s.typeBadge, item.type === 'booking' ? s.typeBadgeBooking : s.typeBadgeEnquiry]}>
                    <Text style={[s.typeBadgeText, item.type === 'booking' ? s.typeBadgeTextBooking : s.typeBadgeTextEnquiry]}>
                      {item.type === 'booking' ? 'Confirmed' : 'Enquiry'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {unread && <View style={s.unreadDot} />}
                  <Text style={[s.threadPreview, unread && s.threadPreviewUnread]} numberOfLines={1}>
                    {item.lastMsg?.senderRole !== 'customer' ? 'You: ' : ''}{item.lastMsg?.text}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={theme.outlineVariant} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={s.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAll(true); }}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <MaterialCommunityIcons name="chat-question-outline" size={52} color={theme.outlineVariant} />
            <Text style={s.emptyTitle}>No messages yet</Text>
            <Text style={s.emptySubtitle}>
              Guest conversations will appear here once they reach out.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#EDF1EF' },
  screen: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Conversation header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1, borderColor: theme.outlineVariant + '40',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  backBtn:       { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerCenter:  { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName:    { fontSize: 15, fontWeight: '700', color: theme.text },
  headerExp:     { fontSize: 11, color: theme.textLight, marginTop: 1 },

  // Type badges
  typeBadge:            { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  typeBadgeBooking:     { backgroundColor: '#EFF6FF' },
  typeBadgeEnquiry:     { backgroundColor: '#FFFBEB' },
  typeBadgeText:        { fontSize: 9, fontWeight: '700' },
  typeBadgeTextBooking: { color: '#2563EB' },
  typeBadgeTextEnquiry: { color: '#B45309' },

  // Notice banner
  noticeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fffbeb', borderBottomWidth: 1, borderColor: '#fde68a',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  noticeText: { fontSize: 11, color: '#b45309', flex: 1, lineHeight: 16 },

  // Thread list
  listContainer: { paddingVertical: 8 },
  threadCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: theme.cardBorder,
  },
  threadAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  threadAvatarText:    { fontSize: 14, fontWeight: '700', color: theme.primary },
  threadTopRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadMidRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  threadName:          { fontSize: 14, fontWeight: '600', color: theme.text, flex: 1 },
  threadNameUnread:    { fontWeight: '700' },
  threadDate:          { fontSize: 10, color: theme.textLight, marginLeft: 8 },
  threadExp:           { fontSize: 11, color: theme.primary },
  threadPreview:       { fontSize: 12, color: theme.textLight, flex: 1 },
  threadPreviewUnread: { color: theme.text, fontWeight: '500' },
  unreadDot:           { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.primary, flexShrink: 0 },

  // Message bubbles
  listContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 10 },
  msgRow:      { flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' },
  msgRowOp:    { alignSelf: 'flex-end' },
  msgRowGuest: { alignSelf: 'flex-start', gap: 8 },
  avatarWrap:  { width: 28, height: 28, borderRadius: 14, overflow: 'hidden' },
  avatarBg:    { width: '100%', height: '100%', backgroundColor: theme.primaryFixed, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { color: theme.primary, fontSize: 10, fontWeight: '700' },
  bubble: {
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  bubbleOp:     { backgroundColor: theme.primary, borderBottomRightRadius: 2 },
  bubbleGuest:  { backgroundColor: theme.surface, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: theme.outlineVariant + '40' },
  msgText:      { fontSize: 14, lineHeight: 20 },
  msgTextOp:    { color: theme.white },
  msgTextGuest: { color: theme.text },
  timeText:     { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  timeTextOp:   { color: theme.white + 'A0' },
  timeTextGuest:{ color: theme.textLight + '90' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: theme.surface, paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderColor: theme.outlineVariant + '40',
  },
  input: {
    flex: 1, backgroundColor: '#EDF1EF',
    borderWidth: 1, borderColor: theme.outlineVariant + '80',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    maxHeight: 100, color: theme.text, fontSize: 14,
  },
  sendBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: theme.outlineVariant },

  // Empty states
  emptyWrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, paddingHorizontal: 32, gap: 12,
  },
  emptyText:     { fontSize: 14, color: theme.textLight },
  emptyTitle:    { fontSize: 17, fontWeight: '700', color: theme.text },
  emptySubtitle: { fontSize: 13, color: theme.textLight, textAlign: 'center', lineHeight: 18 },
});
