Pod::Spec.new do |s|
  s.name           = 'WorktreesStudioMmkv'
  s.version        = '0.1.0'
  s.summary        = 'Synchronous key-value storage via UserDefaults'
  s.description    = 'Replaces react-native-mmkv with Expo Modules API. Uses UserDefaults on iOS.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
