import fs from "fs"
import path from "path"
import { Parser } from "json2csv"
import ExcelJS from "exceljs"
import PDFDocument from "pdfkit"
import { createRequestLogger } from "../utils/logger"
import prisma from "../database/client"
import { ApiError } from "../utils/api-error"
import { Prisma } from "@prisma/client"

// Define export types
export enum ExportFormat {
  CSV = "csv",
  EXCEL = "excel",
  PDF = "pdf",
  JSON = "json",
}

// Define export data types
export enum ExportDataType {
  ORDERS = "orders",
  PRODUCTS = "products",
  CUSTOMERS = "customers",
  SALES = "sales",
  INVENTORY = "inventory",
  LOYALTY_POINTS = "loyalty_points",
  LOYALTY_REDEMPTIONS = "loyalty_redemptions",
  LOYALTY_TIERS = "loyalty_tiers",
  LOYALTY_REFERRALS = "loyalty_referrals",
  VENDORS = "vendors",
  CATEGORIES = "categories",
  REVIEWS = "reviews",
  ANALYTICS = "analytics",
}

/**
 * Generate a unique filename for exports
 * @param dataType Type of data being exported
 * @param format Export format
 * @returns Unique filename
 */
const generateFilename = (dataType: ExportDataType, format: ExportFormat): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  return `${dataType}-export-${timestamp}.${format}`
}

/**
 * Create export directory if it doesn't exist
 * @returns Path to export directory
 */
const ensureExportDirectory = (): string => {
  const exportDir = path.join(process.cwd(), "exports")
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  return exportDir
}

/**
 * Export data to CSV format
 * @param data Data to export
 * @param fields Fields to include in CSV
 * @param dataType Type of data being exported
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportToCsv = async (
  data: any[],
  fields: string[],
  dataType: ExportDataType,
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting ${dataType} to CSV format`)

  try {
    const parser = new Parser({ fields })
    const csv = parser.parse(data)

    const exportDir = ensureExportDirectory()
    const filename = generateFilename(dataType, ExportFormat.CSV)
    const filePath = path.join(exportDir, filename)

    fs.writeFileSync(filePath, csv)
    logger.info(`CSV export completed: ${filePath}`)

    return filePath
  } catch (error: any) {
    logger.error(`Error exporting to CSV: ${error.message}`)
    throw new ApiError(`Failed to export data to CSV: ${error.message}`, 500)
  }
}

/**
 * Export data to Excel format
 * @param data Data to export
 * @param fields Fields to include in Excel
 * @param dataType Type of data being exported
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportToExcel = async (
  data: any[],
  fields: string[],
  dataType: ExportDataType,
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting ${dataType} to Excel format`)

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(dataType)

    // Add header row
    worksheet.addRow(fields.map((field) => field.charAt(0).toUpperCase() + field.slice(1)))

    // Add data rows
    data.forEach((item) => {
      const row = fields.map((field) => {
        const value = field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), item)
        return value !== null && value !== undefined ? value : ""
      })
      worksheet.addRow(row)
    })

    // Format header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10
        if (columnLength > maxLength) {
          maxLength = columnLength
        }
      })
      column.width = maxLength < 10 ? 10 : maxLength + 2
    })

    const exportDir = ensureExportDirectory()
    const filename = generateFilename(dataType, ExportFormat.EXCEL)
    const filePath = path.join(exportDir, filename)

    await workbook.xlsx.writeFile(filePath)
    logger.info(`Excel export completed: ${filePath}`)

    return filePath
  } catch (error: any) {
    logger.error(`Error exporting to Excel: ${error.message}`)
    throw new ApiError(`Failed to export data to Excel: ${error.message}`, 500)
  }
}

/**
 * Export data to PDF format
 * @param data Data to export
 * @param fields Fields to include in PDF
 * @param dataType Type of data being exported
 * @param title Title for the PDF
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportToPdf = async (
  data: any[],
  fields: string[],
  dataType: ExportDataType,
  title: string,
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting ${dataType} to PDF format`)

  try {
    const exportDir = ensureExportDirectory()
    const filename = generateFilename(dataType, ExportFormat.PDF)
    const filePath = path.join(exportDir, filename)

    const doc = new PDFDocument({ margin: 50 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    // Add title
    doc.fontSize(20).text(title, { align: "center" })
    doc.moveDown()

    // Add timestamp
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
    doc.moveDown(2)

    // Define table layout
    const tableTop = 150
    const tableLeft = 50
    const cellPadding = 5
    const columnWidths: number[] = []
    const maxWidth = 500

    // Calculate column widths
    const totalColumns = fields.length
    const equalWidth = Math.floor(maxWidth / totalColumns)
    fields.forEach(() => columnWidths.push(equalWidth))

    // Draw table header
    doc.fontSize(12)
    let currentLeft = tableLeft
    fields.forEach((field, i) => {
      doc
        .rect(currentLeft, tableTop, columnWidths[i], 30)
        .fillAndStroke("#e0e0e0", "#000000")
        .fillColor("#000000")
        .text(field.charAt(0).toUpperCase() + field.slice(1), currentLeft + cellPadding, tableTop + cellPadding)
      currentLeft += columnWidths[i]
    })

    // Draw table rows
    let currentTop = tableTop + 30
    data.forEach((item, rowIndex) => {
      currentLeft = tableLeft
      fields.forEach((field, colIndex) => {
        const value = field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), item)
        const displayValue = value !== null && value !== undefined ? value.toString() : ""

        doc
          .rect(currentLeft, currentTop, columnWidths[colIndex], 25)
          .fillAndStroke(rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9", "#000000")
          .fillColor("#000000")
          .text(displayValue, currentLeft + cellPadding, currentTop + cellPadding, {
            width: columnWidths[colIndex] - cellPadding * 2,
            height: 25 - cellPadding * 2,
          })
        currentLeft += columnWidths[colIndex]
      })
      currentTop += 25

      // Add a new page if we're near the bottom
      if (currentTop > doc.page.height - 100) {
        doc.addPage()
        currentTop = 50
      }
    })

    // Add footer
    doc.fontSize(10).text(`Total Records: ${data.length}`, { align: "right" })

    doc.end()

    // Wait for the stream to finish
    await new Promise<void>((resolve, reject) => {
      stream.on("finish", () => resolve())
      stream.on("error", reject)
    })

    logger.info(`PDF export completed: ${filePath}`)

    return filePath
  } catch (error: any) {
    logger.error(`Error exporting to PDF: ${error.message}`)
    throw new ApiError(`Failed to export data to PDF: ${error.message}`, 500)
  }
}

/**
 * Export data to JSON format
 * @param data Data to export
 * @param dataType Type of data being exported
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportToJson = async (data: any[], dataType: ExportDataType, requestId?: string): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting ${dataType} to JSON format`)

  try {
    const exportDir = ensureExportDirectory()
    const filename = generateFilename(dataType, ExportFormat.JSON)
    const filePath = path.join(exportDir, filename)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    logger.info(`JSON export completed: ${filePath}`)

    return filePath
  } catch (error: any) {
    logger.error(`Error exporting to JSON: ${error.message}`)
    throw new ApiError(`Failed to export data to JSON: ${error.message}`, 500)
  }
}

/**
 * Export orders data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportOrders = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting orders with format: ${format}`)

  try {
    // Build query from filters
    const where: Prisma.OrderWhereInput = {}

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      }
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format data for export
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber || order.id.substring(order.id.length - 8).toUpperCase(),
      customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : "N/A",
      customerEmail: order.user ? order.user.email : "N/A",
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      subtotalAmount: Number(order.subtotalAmount),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount || 0),
      shippingAddress: order.shippingAddress ? 
        `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : 
        "N/A",
      paymentMethod: order.paymentMethod,
      createdAt: new Date(order.createdAt).toLocaleString(),
      itemCount: order.items.length,
      items: order.items.map(item => `${item.product?.name || 'Unknown'} (${item.quantity})`).join('; '),
    }))

    // Define fields to export
    const fields = [
      "id",
      "orderNumber",
      "customerName",
      "customerEmail",
      "status",
      "paymentStatus",
      "totalAmount",
      "subtotalAmount",
      "taxAmount",
      "shippingAmount",
      "discountAmount",
      "shippingAddress",
      "paymentMethod",
      "createdAt",
      "itemCount",
      "items",
    ]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedOrders, fields, ExportDataType.ORDERS, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedOrders, fields, ExportDataType.ORDERS, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedOrders, fields, ExportDataType.ORDERS, "Orders Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedOrders, ExportDataType.ORDERS, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting orders: ${error.message}`)
    throw error
  }
}

/**
 * Export products data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportProducts = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting products with format: ${format}`)

  try {
    // Build query from filters
    const where: Prisma.ProductWhereInput = {}

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId
    }

    if (filters.minPrice && filters.maxPrice) {
      where.price = {
        gte: Number(filters.minPrice),
        lte: Number(filters.maxPrice),
      }
    } else if (filters.minPrice) {
      where.price = { gte: Number(filters.minPrice) }
    } else if (filters.maxPrice) {
      where.price = { lte: Number(filters.maxPrice) }
    }

    if (filters.inStock !== undefined) {
      where.quantity = filters.inStock === "true" ? { gt: 0 } : { lte: 0 }
    }

    if (filters.featured !== undefined) {
      where.isFeatured = filters.featured === "true"
    }

    if (filters.active !== undefined) {
      where.isActive = filters.active === "true"
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            businessName: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Format data for export
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category ? product.category.name : "N/A",
      vendor: product.vendor ? product.vendor.businessName : "N/A",
      price: Number(product.price),
      compareAtPrice: Number(product.compareAtPrice || 0),
      quantity: product.quantity,
      inStock: product.quantity > 0 ? "Yes" : "No",
      featured: product.isFeatured ? "Yes" : "No",
      active: product.isActive ? "Yes" : "No",
      averageRating: product.reviews.length > 0 
        ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(2)
        : "0.00",
      reviewCount: product.reviews.length,
      createdAt: new Date(product.createdAt).toLocaleString(),
      updatedAt: new Date(product.updatedAt).toLocaleString(),
    }))

    // Define fields to export
    const fields = [
      "id",
      "name",
      "sku",
      "category",
      "vendor",
      "price",
      "compareAtPrice",
      "quantity",
      "inStock",
      "featured",
      "active",
      "averageRating",
      "reviewCount",
      "createdAt",
      "updatedAt",
    ]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedProducts, fields, ExportDataType.PRODUCTS, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedProducts, fields, ExportDataType.PRODUCTS, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedProducts, fields, ExportDataType.PRODUCTS, "Products Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedProducts, ExportDataType.PRODUCTS, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting products: ${error.message}`)
    throw error
  }
}

/**
 * Export customers data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportCustomers = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting customers with format: ${format}`)

  try {
    // Build query from filters
    const where: Prisma.UserWhereInput = { role: "CUSTOMER" }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true"
    }

    // Get customers
    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            totalAmount: true,
            status: true,
          },
        },
        addresses: true,
      },
      orderBy: { lastName: 'asc' },
    })

    // Format data for export
    const formattedCustomers = customers.map((customer) => {
      const completedOrders = customer.orders.filter(order => 
        order.status === 'DELIVERED' || order.status === 'SHIPPED'
      )
      const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
      const orderCount = completedOrders.length
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone || "N/A",
        country: customer.country || "N/A",
        isActive: customer.isActive ? "Yes" : "No",
        orderCount,
        totalSpent: totalSpent.toFixed(2),
        averageOrderValue: averageOrderValue.toFixed(2),
        loyaltyPoints: customer.loyaltyPoints || 0,
        createdAt: new Date(customer.createdAt).toLocaleString(),
        lastLoginAt: customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleString() : "Never",
        addressCount: customer.addresses.length,
      }
    })

    // Define fields to export
    const fields = [
      "id",
      "email",
      "fullName",
      "firstName",
      "lastName",
      "phone",
      "country",
      "isActive",
      "orderCount",
      "totalSpent",
      "averageOrderValue",
      "loyaltyPoints",
      "createdAt",
      "lastLoginAt",
      "addressCount",
    ]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedCustomers, fields, ExportDataType.CUSTOMERS, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedCustomers, fields, ExportDataType.CUSTOMERS, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedCustomers, fields, ExportDataType.CUSTOMERS, "Customers Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedCustomers, ExportDataType.CUSTOMERS, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting customers: ${error.message}`)
    throw error
  }
}

/**
 * Export sales data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportSales = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting sales with format: ${format}`)

  try {
    // Get date range from filters
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date()
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    // Get interval from filters
    const interval = filters.interval || "daily"

    // Get sales data using raw SQL for better performance
    let dateFormat = "DATE(\"createdAt\")"
    if (interval === "hourly") {
      dateFormat = "DATE_TRUNC('hour', \"createdAt\")"
    } else if (interval === "weekly") {
      dateFormat = "DATE_TRUNC('week', \"createdAt\")"
    } else if (interval === "monthly") {
      dateFormat = "DATE_TRUNC('month', \"createdAt\")"
    }

    const salesData = await prisma.$queryRaw<any[]>`
      SELECT 
        ${Prisma.raw(dateFormat)} as date,
        SUM("totalAmount") as sales,
        COUNT(*) as orders,
        AVG("totalAmount") as avgOrderValue,
        SUM((
          SELECT SUM("quantity") 
          FROM "OrderItem" 
          WHERE "orderId" = "Order"."id"
        )) as itemsSold
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
        AND "status" IN ('DELIVERED', 'SHIPPED')
      GROUP BY ${Prisma.raw(dateFormat)}
      ORDER BY date ASC
    `

    // Format data for export
    const formattedSales = salesData.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      sales: Number(item.sales).toFixed(2),
      orders: Number(item.orders),
      avgOrderValue: Number(item.avgordervalue).toFixed(2),
      itemsSold: Number(item.itemssold) || 0,
    }))

    // Define fields to export
    const fields = ["date", "sales", "orders", "avgOrderValue", "itemsSold"]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedSales, fields, ExportDataType.SALES, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedSales, fields, ExportDataType.SALES, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedSales, fields, ExportDataType.SALES, "Sales Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedSales, ExportDataType.SALES, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting sales: ${error.message}`)
    throw error
  }
}

/**
 * Export inventory data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportInventory = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting inventory with format: ${format}`)

  try {
    // Build query from filters
    const where: Prisma.ProductWhereInput = {}

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId
    }

    if (filters.minQuantity !== undefined) {
      where.quantity = { gte: Number(filters.minQuantity) }
    }

    if (filters.maxQuantity !== undefined) {
      where.quantity = { ...where.quantity, lte: Number(filters.maxQuantity) }
    }

    if (filters.inStock !== undefined) {
      where.quantity = filters.inStock === "true" ? { gt: 0 } : { lte: 0 }
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        vendor: {
          select: {
            businessName: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
    })

    // Format data for export
    const formattedInventory = products.map((product) => {
      const status = product.quantity <= 0
        ? "Out of Stock"
        : product.quantity <= 5
          ? "Low Stock"
          : product.quantity <= 20
            ? "Medium Stock"
            : "Good Stock"

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category ? product.category.name : "N/A",
        vendor: product.vendor ? product.vendor.businessName : "N/A",
        quantity: product.quantity,
        price: Number(product.price),
        totalValue: (product.quantity * Number(product.price)).toFixed(2),
        status,
        lastUpdated: new Date(product.updatedAt).toLocaleString(),
      }
    })

    // Define fields to export
    const fields = [
      "id",
      "sku",
      "name",
      "category",
      "vendor",
      "quantity",
      "price",
      "totalValue",
      "status",
      "lastUpdated",
    ]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedInventory, fields, ExportDataType.INVENTORY, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedInventory, fields, ExportDataType.INVENTORY, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedInventory, fields, ExportDataType.INVENTORY, "Inventory Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedInventory, ExportDataType.INVENTORY, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting inventory: ${error.message}`)
    throw error
  }
}

/**
 * Export vendors data
 * @param format Export format
 * @param filters Filters to apply to the data
 * @param requestId Request ID for logging
 * @returns Path to exported file
 */
export const exportVendors = async (
  format: ExportFormat,
  filters: Record<string, any> = {},
  requestId?: string,
): Promise<string> => {
  const logger = createRequestLogger(requestId)
  logger.info(`Exporting vendors with format: ${format}`)

  try {
    // Build query from filters
    const where: Prisma.VendorWhereInput = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      }
    }

    // Get vendors
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        products: {
          select: {
            id: true,
            price: true,
          },
        },
      },
      orderBy: { businessName: 'asc' },
    })

    // Format data for export
    const formattedVendors = vendors.map((vendor) => {
      const totalProducts = vendor.products.length
      const totalValue = vendor.products.reduce((sum, product) => sum + Number(product.price), 0)

      return {
        id: vendor.id,
        businessName: vendor.businessName,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone || "N/A",
        status: vendor.status,
        commissionRate: Number(vendor.commissionRate),
        totalProducts,
        totalValue: totalValue.toFixed(2),
        createdAt: new Date(vendor.createdAt).toLocaleString(),
        updatedAt: new Date(vendor.updatedAt).toLocaleString(),
      }
    })

    // Define fields to export
    const fields = [
      "id",
      "businessName",
      "contactEmail",
      "contactPhone",
      "status",
      "commissionRate",
      "totalProducts",
      "totalValue",
      "createdAt",
      "updatedAt",
    ]

    // Export based on format
    switch (format) {
      case ExportFormat.CSV:
        return exportToCsv(formattedVendors, fields, ExportDataType.VENDORS, requestId)
      case ExportFormat.EXCEL:
        return exportToExcel(formattedVendors, fields, ExportDataType.VENDORS, requestId)
      case ExportFormat.PDF:
        return exportToPdf(formattedVendors, fields, ExportDataType.VENDORS, "Vendors Report", requestId)
      case ExportFormat.JSON:
        return exportToJson(formattedVendors, ExportDataType.VENDORS, requestId)
      default:
        throw new ApiError(`Unsupported export format: ${format}`, 400)
    }
  } catch (error: any) {
    logger.error(`Error exporting vendors: ${error.message}`)
    throw error
  }
}
