#!/bin/bash

# LiveKit Installation Script for Booky App
echo "🎥 Installing LiveKit dependencies for video calling..."

# Install LiveKit packages
echo "📦 Installing @livekit/react-native and @livekit/react-native-webrtc..."
npm install @livekit/react-native @livekit/react-native-webrtc

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ LiveKit packages installed successfully!"
    
    # Check if we're on macOS and have iOS folder
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        echo "🍎 Detected iOS project. Installing CocoaPods..."
        cd ios
        pod install
        cd ..
        echo "✅ iOS dependencies installed!"
    fi
    
    echo ""
    echo "🎉 LiveKit installation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Check LIVEKIT_SETUP.md for backend API requirements"
    echo "2. Uncomment LiveKit imports in src/components/VideoCallRoom.tsx"
    echo "3. Test the video call functionality"
    echo ""
else
    echo "❌ Failed to install LiveKit packages"
    echo "Please try running manually:"
    echo "npm install @livekit/react-native @livekit/react-native-webrtc"
    exit 1
fi

