import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 24,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
  },
  coverDescription: {
    fontSize: 14,
    color: "#4b5563",
    maxWidth: 400,
    textAlign: "center",
    lineHeight: 1.6,
  },
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 20,
  },
  gridItem: {
    width: "30%",
    marginBottom: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  ringImage: {
    width: "100%",
    height: 150,
    objectFit: "cover",
  },
  ringDetails: {
    padding: 12,
  },
  ringCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  ringPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B8860B",
    marginBottom: 6,
  },
  ringSpec: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#9ca3af",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
})

interface Ring {
  id: string
  code: string
  name: string
  image_url: string
  price: number
  diamond_points: number
  metal_color: string
  metal_karat: string
}

interface CatalogDocumentProps {
  rings: Ring[]
}

export function CatalogDocument({ rings }: CatalogDocumentProps) {
  // Split rings into pages (6 per page in 2x3 grid)
  const ringsPerPage = 6
  const pages: Ring[][] = []
  for (let i = 0; i < rings.length; i += ringsPerPage) {
    pages.push(rings.slice(i, i + ringsPerPage))
  }

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>Anillos Guillén</Text>
          <Text style={styles.coverSubtitle}>Catálogo de Anillos de Compromiso</Text>
          <Text style={styles.coverDescription}>
            Joyería de confianza en Acapulco. Más de [XX] años ofreciendo anillos de compromiso y joyería fina con
            diamantes certificados, oro de 14k y 18k, y atención personalizada para el día más importante de tu vida.
          </Text>
        </View>
        <Text style={styles.pageNumber}>1</Text>
      </Page>

      {/* Ring Catalog Pages */}
      {pages.map((pageRings, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Text style={styles.header}>Catálogo de Anillos</Text>
          <View style={styles.gridContainer}>
            {pageRings.map((ring) => (
              <View key={ring.id} style={styles.gridItem}>
                <Image src={ring.image_url || "/placeholder.svg?height=300&width=300"} style={styles.ringImage} />
                <View style={styles.ringDetails}>
                  <Text style={styles.ringCode}>{ring.code}</Text>
                  <Text style={styles.ringPrice}>${ring.price?.toLocaleString("es-MX")} MXN</Text>
                  <Text style={styles.ringSpec}>{ring.diamond_points} puntos de diamante</Text>
                  <Text style={styles.ringSpec}>
                    {ring.metal_color} {ring.metal_karat}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.pageNumber}>{pageIndex + 2}</Text>
        </Page>
      ))}
    </Document>
  )
}
