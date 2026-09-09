// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  wikiSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'MeshCore',
      collapsed: false,
      items: [
        'meshcore/overview',
        'meshcore/frequency',
        'meshcore/regions',
        {
          type: 'doc',
          id: 'meshcore/channels',
          label: 'Channels'
        },
        'meshcore/repeaters',
        'meshcore/observers',
        'meshcore/bots',
        'meshcore/maps'
      ]
    },
    {
      type: 'category',
      label: 'Meshtastic',
      collapsed: false,
      items: [
        'meshtastic/overview'
      ]
    },
    {
      type: 'category',
      label: 'Hardware',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Repeaters',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'hardware/repeaters/overview',
              label: 'Overview'
            },
            'hardware/repeaters/clandestine-nodes',
            'hardware/repeaters/aldi-solar-repeater'
          ]
        },
        {
          type: 'category',
          label: 'Companions',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'hardware/companions/overview',
              label: 'Overview'
            }
          ]
        }
      ]
    },
    {
      type: 'doc',
      id: 'partners/overview',
      label: 'Partners'
    },
    'other-mesh-communities',
    'brand-guidelines',
    'contributing'
  ]
};

module.exports = sidebars;
