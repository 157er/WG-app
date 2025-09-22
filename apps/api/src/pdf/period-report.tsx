import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface PeriodReportProps {
  groupName: string;
  currency: string;
  period: { from: string; to: string };
  expenses: Array<{ date: string; payer: string; category: string; amount: number }>;
  balances: Array<{ member: string; net: number }>;
  settlements: Array<{ from: string; to: string; amount: number }>;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, fontFamily: "Helvetica" },
  heading: { fontSize: 20, marginBottom: 16 },
  section: { marginBottom: 12 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#999" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingVertical: 4 },
  cell: { flex: 1 },
});

export function PeriodReportDocument({
  groupName,
  currency,
  period,
  expenses,
  balances,
  settlements,
}: PeriodReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.heading}>Ausgabenübersicht</Text>
          <Text>{groupName}</Text>
          <Text>
            Zeitraum: {period.from} – {period.to}
          </Text>
          <Text>Währung: {currency}</Text>
          <Text>Erstellt am: {new Date().toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Ausgaben</Text>
          <Table
            headers={["Datum", "Zahler", "Kategorie", `Betrag (${currency})`]}
            rows={expenses.map((expense) => [
              expense.date,
              expense.payer,
              expense.category,
              expense.amount.toFixed(2),
            ])}
          />
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Salden</Text>
          <Table
            headers={["Mitglied", `Netto (${currency})`]}
            rows={balances.map((balance) => [balance.member, balance.net.toFixed(2)])}
          />
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Ausgleichsvorschläge</Text>
          <Table
            headers={["Von", "An", `Betrag (${currency})`]}
            rows={settlements.map((settlement) => [
              settlement.from,
              settlement.to,
              settlement.amount.toFixed(2),
            ])}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text>
            Diese Abrechnung wurde automatisch erstellt. Bei Fragen melde dich gern im WG-Split
            Support.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface TableProps {
  headers: string[];
  rows: string[][];
}

function Table({ headers, rows }: TableProps) {
  return (
    <View>
      <View style={styles.tableHeader}>
        {headers.map((header) => (
          <Text key={header} style={[styles.cell, { fontWeight: "bold" }]}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          {row.map((value, idx) => (
            <Text key={`${index}-${idx}`} style={styles.cell}>
              {value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
