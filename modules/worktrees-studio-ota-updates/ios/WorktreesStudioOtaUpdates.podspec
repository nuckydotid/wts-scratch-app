Pod::Spec.new do |s|
  s.name           = 'WorktreesStudioOtaUpdates'
  s.version        = '0.1.0'
  s.summary        = 'Worktrees Studio OTA bundle download and apply'
  s.description    = 'Downloads and applies OTA JavaScript bundles for Worktrees Studio Expo apps'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'ZIPFoundation', '~> 0.9'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
