"use client";

import { motion } from "framer-motion";
import { Star, MessageCircleHeart } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5 yulduz`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={cn(
            i < rating ? "fill-warning text-warning" : "fill-surface-muted text-surface-muted"
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-200 bg-brand-50 px-4 py-1.5 text-caption font-semibold text-brand-600">
            <MessageCircleHeart size={14} />
            Fikrlar
          </span>
          <h2 className="mt-5 font-display text-display-lg text-ink-900">
            Foydalanuvchilarimiz fikri
          </h2>
          <p className="mt-4 text-body-lg text-ink-600">
            Namunaviy foydalanuvchi tajribalari — VIZAR AI qanday yordam
            berishi mumkinligini ko&apos;rsatish uchun keltirilgan.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              className="card card-hover flex flex-col gap-4 p-6"
            >
              <StarRating rating={testimonial.rating} />
              <p className="flex-1 text-body-sm text-ink-600">
                &quot;{testimonial.review}&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-surface-border pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-body-sm font-semibold text-white">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-ink-900">
                    {testimonial.name}
                  </p>
                  <p className="text-caption text-ink-400">
                    {testimonial.country}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
