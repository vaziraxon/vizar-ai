import { InlineAlert } from "@/components/states/InlineAlert";
import { L } from "@/components/i18n/L";

/** The agency area is a prototype: say so above every page, so sample clients aren't read as real ones. */
export function AgencySampleNotice() {
  return (
    <div className="mb-6">
      <InlineAlert variant="warning">
        <L>Namuna: agentlik bo‘limi hali ishlab chiqilmoqda. Bu yerdagi mijozlar, raqamlar va arizalar to‘qima — haqiqiy ma’lumot emas.</L>
      </InlineAlert>
    </div>
  );
}
