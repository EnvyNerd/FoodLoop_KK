import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { updateProduct, getVendorProducts } from '../../services/api';

const CATEGORIES = ['Bakery', 'Cafe', 'Restaurant', 'Hotel', 'Supermarket'];
const HALAL_OPTIONS = ['halal', 'mixed', 'non-halal'];

export default function EditProductScreen({ route, navigation }) {
  const { bagId } = route.params;
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState('');
  const [category, setCategory] = useState('Bakery');
  const [halal, setHalal] = useState('halal');
  const [priceNow, setPriceNow] = useState('');
  const [priceOriginal, setPriceOriginal] = useState('');
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [quantityTotal, setQuantityTotal] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getVendorProducts('vendor-001').then(res => {
      const bag = (res.products || []).find(b => b.id === bagId);
      if (bag) {
        setName(bag.name || '');
        setDescription(bag.description || '');
        setContents(bag.contents || '');
        setCategory(bag.category || 'Bakery');
        setHalal(bag.halal || 'halal');
        setPriceNow(bag.priceNow ? String(bag.priceNow) : '');
        setPriceOriginal(bag.priceOriginal ? String(bag.priceOriginal) : '');
        setPickupStart(bag.pickupStart || '');
        setPickupEnd(bag.pickupEnd || '');
        setPickupAddress(bag.pickupAddress || '');
        setQuantityTotal(bag.quantityTotal ? String(bag.quantityTotal) : '');
        setTags((bag.tags || []).join(', '));
        if (bag.image) { setExistingImage(bag.image); setImage(bag.image); }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bagId]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant camera roll permissions.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant camera permissions.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  function showImageOptions() {
    Alert.alert('Change Photo', '', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a bag name'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please enter a description'); return; }
    if (!contents.trim()) { Alert.alert('Error', 'Please enter the contents'); return; }
    if (!priceNow.trim() || isNaN(parseFloat(priceNow))) { Alert.alert('Error', 'Please enter a valid current price'); return; }
    if (!priceOriginal.trim() || isNaN(parseFloat(priceOriginal))) { Alert.alert('Error', 'Please enter a valid original price'); return; }
    if (!pickupStart.trim()) { Alert.alert('Error', 'Please enter a pickup start time'); return; }
    if (!pickupEnd.trim()) { Alert.alert('Error', 'Please enter a pickup end time'); return; }
    if (!quantityTotal.trim() || isNaN(parseInt(quantityTotal))) { Alert.alert('Error', 'Please enter a valid quantity'); return; }

    setIsSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      await updateProduct(bagId, {
        name: name.trim(), description: description.trim(), contents: contents.trim(),
        category, halal, priceNow: parseFloat(priceNow), priceOriginal: parseFloat(priceOriginal),
        pickupStart: pickupStart.trim(), pickupEnd: pickupEnd.trim(),
        pickupAddress: pickupAddress.trim(), quantityTotal: parseInt(quantityTotal),
        tags: tagList, image,
      });
      Alert.alert('Success', 'Bag updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update bag.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
          <Text style={s.heading}>Edit Bag</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>{'\u2039'} Back</Text></TouchableOpacity>
        <Text style={s.heading}>Edit Bag</Text>
        <View style={{ width: 50 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={s.label}>Bag Photo</Text>
          <TouchableOpacity style={s.imagePickerBtn} onPress={showImageOptions}>
            {image ? (
              typeof image === 'string' && image.startsWith('http')
                ? <Image source={{ uri: image }} style={s.imagePreview} />
                : typeof image === 'string'
                  ? <Image source={{ uri: image }} style={s.imagePreview} />
                  : <Image source={existingImage} style={s.imagePreview} />
            ) : (
              <View style={s.imagePlaceholder}>
                <Text style={s.imageIcon}>{'\u{1F4F7}'}</Text>
                <Text style={s.imageText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && <TouchableOpacity onPress={showImageOptions}><Text style={s.changePhotoText}>Change photo</Text></TouchableOpacity>}

          <Text style={s.label}>Bag Name</Text>
          <TextInput style={s.input} placeholder='e.g. "Sunrise Bakery Surprise Bag"' placeholderTextColor={Colors.textTertiary} value={name} onChangeText={setName} />

          <Text style={s.label}>Description</Text>
          <TextInput style={[s.input, s.textArea]} placeholder="Describe what's in this surprise bag..." placeholderTextColor={Colors.textTertiary} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

          <Text style={s.label}>Contents</Text>
          <TextInput style={s.input} placeholder='e.g. "Bread, pastries, buns - mixed selection"' placeholderTextColor={Colors.textTertiary} value={contents} onChangeText={setContents} />

          <Text style={s.label}>Category</Text>
          <View style={s.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCategory(c)}><Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text></TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Halal Status</Text>
          <View style={s.chipRow}>
            {HALAL_OPTIONS.map(h => (
              <TouchableOpacity key={h} style={[s.chip, halal === h && s.chipActive]} onPress={() => setHalal(h)}><Text style={[s.chipText, halal === h && s.chipTextActive]}>{h === 'halal' ? '\u2713 Halal' : h === 'mixed' ? 'Mixed' : 'Non-halal'}</Text></TouchableOpacity>
            ))}
          </View>

          <View style={s.row}>
            <View style={s.half}><Text style={s.label}>Current Price (RM)</Text><TextInput style={s.input} placeholder="6" placeholderTextColor={Colors.textTertiary} value={priceNow} onChangeText={setPriceNow} keyboardType="decimal-pad" /></View>
            <View style={s.half}><Text style={s.label}>Original Price (RM)</Text><TextInput style={s.input} placeholder="18" placeholderTextColor={Colors.textTertiary} value={priceOriginal} onChangeText={setPriceOriginal} keyboardType="decimal-pad" /></View>
          </View>

          <View style={s.row}>
            <View style={s.half}><Text style={s.label}>Pickup Start</Text><TextInput style={s.input} placeholder="19:30" placeholderTextColor={Colors.textTertiary} value={pickupStart} onChangeText={setPickupStart} /></View>
            <View style={s.half}><Text style={s.label}>Pickup End</Text><TextInput style={s.input} placeholder="20:30" placeholderTextColor={Colors.textTertiary} value={pickupEnd} onChangeText={setPickupEnd} /></View>
          </View>

          <Text style={s.label}>Pickup Address</Text>
          <TextInput style={s.input} placeholder='e.g. "Jalan Dunlop, Tawau, Sabah"' placeholderTextColor={Colors.textTertiary} value={pickupAddress} onChangeText={setPickupAddress} />

          <Text style={s.label}>Total Quantity</Text>
          <TextInput style={s.input} placeholder="10" placeholderTextColor={Colors.textTertiary} value={quantityTotal} onChangeText={setQuantityTotal} keyboardType="number-pad" />

          <Text style={s.label}>Tags (comma-separated)</Text>
          <TextInput style={s.input} placeholder='e.g. "Vegetarian, No nuts, Fresh today"' placeholderTextColor={Colors.textTertiary} value={tags} onChangeText={setTags} />

          <TouchableOpacity style={[s.submitBtn, isSubmitting && s.submitBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={s.submitBtnText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: Colors.white, ...Typography.bodySm, width: 50 },
  heading: { ...Typography.headingMd, color: Colors.white, textAlign: 'center' },
  scrollContent: { padding: Spacing.lg },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: { height: 48, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: Radius.md, paddingHorizontal: 14, fontSize: 15, backgroundColor: Colors.bgSecondary, color: Colors.textPrimary },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  half: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderMedium, backgroundColor: Colors.bgSecondary },
  chipActive: { backgroundColor: Colors.primarySurface, borderColor: Colors.primary },
  chipText: { ...Typography.label, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  imagePickerBtn: { height: 160, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderMedium, borderStyle: 'dashed', overflow: 'hidden', marginBottom: Spacing.xs },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  imageIcon: { fontSize: 32 },
  imageText: { ...Typography.caption, color: Colors.textTertiary },
  changePhotoText: { ...Typography.caption, color: Colors.primary, textAlign: 'center', marginBottom: Spacing.sm },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
