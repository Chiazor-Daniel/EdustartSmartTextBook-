import { useGetCardsQuery, useGetSubtopicsQuery } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import WebView from 'react-native-webview';
import FloatingAI from '../../../../components/FloatingAI';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const SimulationScreen = () => {
  const { subjectId, topicId } = useLocalSearchParams<{
    subjectId: string;
    topicId: string;
  }>();

  // State management
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const { setHeaderVisible, setBottomNavVisible } = useUIStore();
  const [activeTab, setActiveTab] = useState('Topics');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [isWebViewMounted, setIsWebViewMounted] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;

  // Hide navigation elements when component mounts
  useEffect(() => {
    // Hide navigation when entering the screen
    setHeaderVisible(false);
    setBottomNavVisible(false);

    // Restore navigation when leaving the screen
    return () => {
      setHeaderVisible(true);
      setBottomNavVisible(true);
    };
  }, []); // Empty dependency array means this runs once when mounted

  // API calls
  const { data: subtopicsData } = useGetSubtopicsQuery({ 
    topic_id: parseInt(topicId || '1', 10) 
  });

  useEffect(() => {
    console.log(subtopicsData);
    console.log(selectedSubtopicId);
  }, []);

  const { data: cardsData, isLoading, error } = useGetCardsQuery({
    subject_id: parseInt(subjectId || '4', 10),
    topic_id: parseInt(topicId || '1', 10),
    subtopic_id: selectedSubtopicId || undefined,
    isOnline: true
  });

  const currentCard = cardsData?.results?.[currentCardIndex];
  const webviewRef = useRef<WebView>(null);
  const lastLoadedModel = useRef<string | null>(null);

  // Handle navigation visibility when fullscreen changes
  useEffect(() => {
    // Hide navigation when entering this screen
    setHeaderVisible(false);
    setBottomNavVisible(false);
    
    return () => {
      // Restore navigation when leaving this screen
      setHeaderVisible(true);
      setBottomNavVisible(true);
    };
  }, []); // Only run when component mounts/unmounts

  // Handle subtopic selection
  const handleSubtopicSelect = useCallback((subtopicId: number) => {
    setSelectedSubtopicId(subtopicId);
    setCurrentCardIndex(0);
    setIsModelLoaded(false);
  }, []);

  // Audio management
  const loadAudio = useCallback(async () => {
    if (!currentCard?.audio_file) return;

    try {
      setIsAudioLoading(true);
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentCard.audio_file },
        { shouldPlay: false },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) setIsPlaying(false);
          }
        }
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsAudioLoading(false);
    }
  }, [currentCard?.audio_file]);

  const handlePlayPause = async () => {
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const handleMute = async () => {
    if (!sound) return;
    await sound.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleReset = async () => {
    if (!sound) return;
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    setIsPlaying(false);
  };

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    try {
      if (newFullscreenState) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        Platform.OS === 'android' && RNStatusBar.setHidden(true);
      } else {
        await ScreenOrientation.unlockAsync();
        Platform.OS === 'android' && RNStatusBar.setHidden(false);
      }
    } catch (error) {
      console.error('Error changing screen orientation:', error);
    }
  }, [isFullscreen]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      ScreenOrientation.unlockAsync();
      Platform.OS === 'android' && RNStatusBar.setHidden(false);
    };
  }, []);

  // Load audio when card changes
  useEffect(() => {
    if (currentCard?.audio_file) loadAudio();
  }, [currentCard?.audio_file]);

  // Optimize model loading
  useEffect(() => {
    if (currentCard?.verge3d_file && lastLoadedModel.current !== currentCard.verge3d_file) {
      setIsLoadingModel(true);
      lastLoadedModel.current = currentCard.verge3d_file;
    }
  }, [currentCard?.verge3d_file]);

  // Cleanup WebView
  useEffect(() => {
    return () => {
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(`
          if (window.verge3d) {
            verge3d.dispose();
          }
        `);
      }
    };
  }, []);

  // Optimize WebView mounting
  const handleWebViewLoad = useCallback(() => {
    setIsWebViewMounted(true);
    setIsWebViewReady(true);
  }, []);

  // Optimize WebView configuration
  const webViewConfig = {
    originWhitelist: ['*'] as const,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    cacheEnabled: true,
    androidLayerType: 'hardware' as 'hardware' | 'software' | 'none',
    renderToHardwareTextureAndroid: true,
    onLoadEnd: () => {
      setIsWebViewReady(true);
      setIsModelLoaded(true);
    },
    startInLoadingState: true,
    renderLoading: () => (
      <View style={styles.webviewLoading}>
        <ActivityIndicator size="large" color="#6B8AF7" />
        <Text style={styles.loadingText}>Loading 3D content...</Text>
      </View>
    ),
  };

  // Optimize Verge3D HTML template
  const getVerge3DTemplate = useCallback((verge3dFile: string) => `
    <!DOCTYPE html>
    <html style="height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden;">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #000;
        }
        iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          border: none;
          overflow: hidden;
        }
      </style>
      <script>
        window.addEventListener('load', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'modelLoaded'
          }));
        });
      </script>
    </head>
    <body>
      <iframe 
        src="${verge3dFile}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        loading="lazy"
      ></iframe>
    </body>
    </html>
  `, []);

  // Optimize render conditions
  const shouldRenderWebView = useCallback(() => {
    return currentCard?.verge3d_file && (isFullscreen || isWebViewMounted);
  }, [currentCard?.verge3d_file, isFullscreen, isWebViewMounted]);

  // Render experiment item for carousel
  const renderExperimentItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={[
        styles.experimentItem,
        currentCardIndex === index && styles.selectedExperimentItem
      ]}
      onPress={() => {
        setIsModelLoaded(false);
        setCurrentCardIndex(index);
      }}
    >
      {item.thumbnail_file ? (
        <Image
          source={{ uri: item.thumbnail_file }}
          style={styles.experimentImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.experimentFallback}>
          <Ionicons name="image-outline" size={24} color="white" />
        </View>
      )}
      <Text style={styles.experimentTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Panel animation handlers
  const togglePanel = useCallback(() => {
    const toValue = isPanelVisible ? 0 : 1;
    Animated.spring(panelAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
    setIsPanelVisible(!isPanelVisible);
  }, [isPanelVisible]);

  if (isLoading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6B8AF7" />
      <Text style={styles.loadingText}>Loading content...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <Feather name="alert-circle" size={40} color="#EF4444" />
      <Text style={styles.errorText}>Failed to load content</Text>
      <TouchableOpacity style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor='#ooo'/>
      {/* Fullscreen Mode */}
      {isFullscreen && currentCard?.verge3d_file && (
        <View style={styles.fullscreenContainer}>
          <FloatingAI />
          <WebView
            ref={webviewRef}
            style={styles.fullscreenWebView}
            source={{
              html: getVerge3DTemplate(currentCard.verge3d_file)
            }}
            {...webViewConfig}
          />

          {/* Floating Controls */}
          <View style={styles.floatingControlsContainer}>
            <View style={styles.floatingHeader}>
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={toggleFullscreen}
              >
                <Ionicons name="contract-outline" size={24} color="white" />
              </TouchableOpacity>

              <Text style={styles.floatingTitle} numberOfLines={1}>
                {currentCard.title}
              </Text>
            </View>

            <View style={styles.floatingMediaControls}>
              {currentCard?.audio_file && (
                <>
                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handleMute}
                    disabled={isAudioLoading}
                  >
                    <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={22} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handlePlayPause}
                    disabled={isAudioLoading}
                  >
                    {isAudioLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="white" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handleReset}
                    disabled={isAudioLoading}
                  >
                    <Ionicons name="refresh" size={22} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Sliding Panel Toggle Button */}
          <TouchableOpacity
            style={[
              styles.panelToggleButton,
              { transform: [{ translateY: panelAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -200]
              })}] }
            ]}
            onPress={togglePanel}
          >
            <Ionicons
              name={isPanelVisible ? "chevron-down" : "chevron-up"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {/* Sliding Panel */}
          <Animated.View
            style={[
              styles.slidingPanel,
              {
                transform: [{
                  translateY: panelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0]
                  })
                }]
              }
            ]}
          >
            {/* Panel Tabs */}
            <View style={styles.panelTabs}>
              <TouchableOpacity
                style={[styles.panelTab, activeTab === 'Content' && styles.activePanelTab]}
                onPress={() => setActiveTab('Content')}
              >
                <Ionicons name="book-outline" size={20} color="white" />
                <Text style={styles.panelTabText}>Content</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.panelTab, activeTab === 'Topics' && styles.activePanelTab]}
                onPress={() => setActiveTab('Topics')}
              >
                <Ionicons name="list-outline" size={20} color="white" />
                <Text style={styles.panelTabText}>Subtopics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.panelTab, activeTab === 'Search' && styles.activePanelTab]}
                onPress={() => setActiveTab('Search')}
              >
                <Ionicons name="search-outline" size={20} color="white" />
                <Text style={styles.panelTabText}>Search</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.panelContent}>
              {/* Content Tab */}
              {activeTab === 'Content' && currentCard && (
                <View style={styles.panelTabContent}>
                  {currentCard.content ? (
                    <WebView
                      originWhitelist={['*'] as string[]}
                      source={{
                        html: `
                          <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                              body {
                                font-family: system-ui, -apple-system, sans-serif;
                                padding: 16px;
                                color: white;
                                background-color: #121212;
                                font-size: 16px;
                                line-height: 1.5;
                              }
                              p { margin-bottom: 16px; }
                              strong { color: #6B8AF7; }
                              table { border-collapse: collapse; margin: 16px 0; width: 100%; }
                              td, th { border: 1px solid #334155; padding: 8px; }
                              th { background-color: #1E293B; }
                            </style>
                          </head>
                          <body>
                            ${currentCard.content}
                          </body>
                          </html>
                        `
                      }}
                      style={{ height: height * 0.6, backgroundColor: '#121212' }}
                    />
                  ) : (
                    <View style={styles.noContentContainer}>
                      <Text style={styles.noContentText}>No content available for this topic</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Topics Tab */}
              {activeTab === 'Topics' && subtopicsData && (
                <View style={styles.panelTabContent}>
                  {subtopicsData.results.map((subtopic: Subtopic) => (
                    <TouchableOpacity
                      key={subtopic.id}
                      style={[
                        styles.topicItem,
                        selectedSubtopicId === subtopic.id && styles.activeTopicItem
                      ]}
                      onPress={() => handleSubtopicSelect(subtopic.id)}
                    >
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={16} color="white" />
                      </View>
                      <Text style={styles.topicText}>{subtopic.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Search Tab */}
              {activeTab === 'Search' && (
                <View style={styles.panelTabContent}>
                  <View style={styles.searchInputContainer}>
                    <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search content"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <Text style={styles.searchHint}>Type to search for topics and content</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* Regular Simulation View */}
      {!isLoading && !error && currentCard && !isFullscreen && (
        <>
          <View style={styles.simulationContainer}>
            <View style={styles.simulationHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.experimentLabel}>
                <Text style={styles.experimentLabelText}>{currentCard.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={toggleFullscreen}
              >
                <Ionicons
                  name="expand-outline"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {currentCard?.verge3d_file ? (
              <WebView
                ref={webviewRef}
                style={[styles.simulationImage, isFullscreen && styles.fullscreenWebView]}
                source={{ 
                  html: `<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="width: 100%; height: 100%; border: none; background-color: transparent;" src="${currentCard.verge3d_file}" />` 
                }}
                {...webViewConfig}
              />
            ) : currentCard?.thumbnail_file ? (
              <Image
                source={{ uri: currentCard.thumbnail_file }}
                style={styles.simulationImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Feather name="image" size={40} color="#64748B" />
                <Text style={styles.noImageText}>No visualization available</Text>
              </View>
            )}

            <View style={styles.controlsContainer}>
              <View style={styles.mediaControls}>
                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handleMute}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handlePlayPause}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  {isAudioLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name={isPlaying ? "pause" : "play"} size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handleReset}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  <Ionicons name="refresh" size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="settings-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Experiments Carousel */}
          {cardsData?.results && (
            <View style={styles.experimentsContainer}>
              <FlatList
                data={cardsData.results}
                renderItem={renderExperimentItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.experimentsList}
              />
            </View>
          )}

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Content' && styles.activeTab]}
              onPress={() => setActiveTab('Content')}
            >
              <Ionicons name="book-outline" size={20} color="white" />
              <Text style={styles.tabText}>Content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'Topics' && styles.activeTab]}
              onPress={() => setActiveTab('Topics')}
            >
              <Ionicons name="list-outline" size={20} color="white" />
              <Text style={styles.tabText}>Content List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'Search' && styles.activeTab]}
              onPress={() => setActiveTab('Search')}
            >
              <Ionicons name="search-outline" size={20} color="white" />
              <Text style={styles.tabText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Content View */}
          {activeTab === 'Content' && currentCard && (
            <View style={styles.contentContainer}>
              {currentCard.content ? (
                <WebView
                  originWhitelist={['*'] as string[]}
                  source={{
                    html: `
                      <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body {
                            font-family: system-ui, -apple-system, sans-serif;
                            padding: 16px;
                            color: white;
                            background-color: #121212;
                            font-size: 16px;
                            line-height: 1.5;
                          }
                          p { margin-bottom: 16px; }
                          strong { color: #6B8AF7; }
                          table { border-collapse: collapse; margin: 16px 0; width: 100%; }
                          td, th { border: 1px solid #334155; padding: 8px; }
                          th { background-color: #1E293B; }
                        </style>
                      </head>
                      <body>
                        ${currentCard.content}
                      </body>
                      </html>
                    `
                  }}
                  style={{ height: height * 0.6, backgroundColor: '#121212' }}
                />
              ) : (
                <View style={styles.noContentContainer}>
                  <Text style={styles.noContentText}>No content available for this topic</Text>
                </View>
              )}
            </View>
          )}

          {/* Topics List */}
          {activeTab === 'Topics' && subtopicsData && (
            <ScrollView style={styles.topicsContainer}>
              {subtopicsData.results.map((subtopic: Subtopic) => (
                <TouchableOpacity
                  key={subtopic.id}
                  style={[
                    styles.topicItem,
                    selectedSubtopicId === subtopic.id && styles.activeTopicItem
                  ]}
                  onPress={() => handleSubtopicSelect(subtopic.id)}
                >
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={16} color="white" />
                  </View>
                  <Text style={styles.topicText}>{subtopic.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Search Tab */}
          {activeTab === 'Search' && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search content"
                  placeholderTextColor="#64748B"
                />
              </View>
              <Text style={styles.searchHint}>Type to search for topics and content</Text>
            </View>
          )}
          <FloatingAI />
        </>
      )}
    </SafeAreaView>
  );
};

// Keep all your existing styles exactly as they were
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  simulationContainer: {
    height: 500,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    backgroundColor: '#000',
    paddingTop: 0,
    position: 'relative',
  },
  floatingControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    padding: 16,
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    marginBottom: 16,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  floatingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  floatingMediaControls: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  floatingControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fullscreenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  simulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  experimentLabel: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 16,
    flex: 1,
  },
  experimentLabelText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  simulationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: 8,
  },
  simulationImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  fullscreenWebView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 1,
    paddingTop: 8,
  },
  mediaControls: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  experimentsContainer: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  experimentsList: {
    paddingHorizontal: 8,
  },
  experimentItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedExperimentItem: {
    borderColor: '#3B82F6',
  },
  experimentImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.2 }],
    objectFit: 'cover',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    backgroundColor: '#2C3E50',
  },
  tabText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  topicsContainer: {
    flex: 1,
    backgroundColor: '#121212',
    paddingVertical: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 0,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
    height: height * 0.6,
  },
  noContentText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  activeTopicItem: {
    backgroundColor: 'rgba(107, 138, 247, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#6B8AF7',
  },
  searchContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: 'white',
    fontSize: 16,
  },
  searchHint: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  experimentFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experimentTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  panelToggleButton: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
    transform: [{ translateX: -20 }],
  },
  slidingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#121212',
    zIndex: 1001,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  panelContent: {
    flex: 1,
  },
  panelTabContent: {
    flex: 1,
    padding: 16,
  },
  panelTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#121212',
  },
  panelTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activePanelTab: {
    backgroundColor: 'rgba(107, 138, 247, 0.2)',
  },
  panelTabText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default SimulationScreen;