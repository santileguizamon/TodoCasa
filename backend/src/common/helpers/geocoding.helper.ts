export async function geocodeDireccion(direccion: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      direccion
    )}&limit=1`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TODOCASA-App (contacto@email.com)',
      },
    })

    const data = await res.json()

    if (!data.length) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch (error) {
    console.log('Error geocoding:', error)
    return null
  }
}
