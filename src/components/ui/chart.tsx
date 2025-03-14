
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// Adding the missing chart components
const defaultChartConfig: ChartConfig = {
  value: { color: "hsl(var(--primary))" },
  systolic: { color: "#ef4444", label: "Systolic BP" },
  diastolic: { color: "#f97316", label: "Diastolic BP" },
  heartRate: { color: "#3b82f6", label: "Heart Rate" },
  oxygenSaturation: { color: "#22c55e", label: "O₂ Saturation" },
}

interface AreaChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
}

export const AreaChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
}: AreaChartProps) => {
  const config = React.useMemo(() => {
    return categories.reduce((acc, category, i) => {
      acc[category] = { color: colors?.[i] }
      return acc
    }, { ...defaultChartConfig })
  }, [categories, colors])

  return (
    <ChartContainer config={config}>
      <RechartsPrimitive.AreaChart data={data}>
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
        <RechartsPrimitive.XAxis dataKey={index} />
        <RechartsPrimitive.YAxis />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => valueFormatter(Number(value))} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((category, i) => (
          <RechartsPrimitive.Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={colors?.[i] || config[category]?.color}
            stroke={colors?.[i] || config[category]?.color}
            fillOpacity={0.2}
          />
        ))}
      </RechartsPrimitive.AreaChart>
    </ChartContainer>
  )
}

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  layout?: "horizontal" | "vertical"
}

export const BarChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  layout = "horizontal",
}: BarChartProps) => {
  const config = React.useMemo(() => {
    return categories.reduce((acc, category, i) => {
      acc[category] = { color: colors?.[i] }
      return acc
    }, { ...defaultChartConfig })
  }, [categories, colors])

  const horizontal = layout === "horizontal"

  return (
    <ChartContainer config={config}>
      <RechartsPrimitive.BarChart
        data={data}
        layout={layout}
      >
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <RechartsPrimitive.XAxis dataKey={index} />
            <RechartsPrimitive.YAxis />
          </>
        ) : (
          <>
            <RechartsPrimitive.XAxis type="number" />
            <RechartsPrimitive.YAxis dataKey={index} type="category" />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => valueFormatter(Number(value))} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((category, i) => (
          <RechartsPrimitive.Bar
            key={category}
            dataKey={category}
            fill={colors?.[i] || config[category]?.color}
          />
        ))}
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  )
}

interface LineChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
}

export const LineChart = ({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
}: LineChartProps) => {
  const config = React.useMemo(() => {
    return categories.reduce((acc, category, i) => {
      acc[category] = { color: colors?.[i] }
      return acc
    }, { ...defaultChartConfig })
  }, [categories, colors])

  return (
    <ChartContainer config={config}>
      <RechartsPrimitive.LineChart data={data}>
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
        <RechartsPrimitive.XAxis dataKey={index} />
        <RechartsPrimitive.YAxis />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => valueFormatter(Number(value))} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {categories.map((category, i) => (
          <RechartsPrimitive.Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors?.[i] || config[category]?.color}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsPrimitive.LineChart>
    </ChartContainer>
  )
}

interface PieChartProps {
  data: any[]
  index: string
  categoryKey: string
  valueFormatter?: (value: number) => string
}

export const PieChart = ({
  data,
  index,
  categoryKey,
  valueFormatter = (value) => `${value}`,
}: PieChartProps) => {
  // Create config from data items
  const config = React.useMemo(() => {
    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#f59e0b", // amber
      "#10b981", // emerald 
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#6366f1", // indigo
      "#14b8a6", // teal
      "#f97316", // orange
      "#a855f7", // purple
    ]
    
    return data.reduce((acc, item, i) => {
      const name = item[index]
      acc[name] = { color: colors[i % colors.length] }
      return acc
    }, { ...defaultChartConfig })
  }, [data, index])

  return (
    <ChartContainer config={config}>
      <RechartsPrimitive.PieChart>
        <RechartsPrimitive.Pie
          data={data}
          dataKey={categoryKey}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(props) => props.name}
          labelLine={true}
        >
          {data.map((entry, i) => (
            <RechartsPrimitive.Cell 
              key={`cell-${i}`} 
              fill={config[entry[index]]?.color} 
            />
          ))}
        </RechartsPrimitive.Pie>
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => valueFormatter(Number(value))} />} />
        <ChartLegend content={<ChartLegendContent />} />
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
