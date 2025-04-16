"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Instagram } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Community() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const communities = [
    {
      icon: <Facebook className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-red-100 dark:bg-blue-900",
      title: "Facebook",
      description:
        "Ikuti Juga kami di facebook kami juga rutin membagikan informasi event atau hal-hal yang lain",
      buttonText: "Follow Kami",
      buttonLink: "/facebook",
    },
    {
      icon: <Instagram className="h-6 w-6 text-red-400 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-900",
      title: "Instagram",
      description:
        "Ikuti kami di Instagram untuk tips programming, konten inspiratif, dan info event terbaru.",
      buttonText: "Follow Kami",
      buttonLink: "/instagram",
    },
    {
      icon: (
        <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      ),
      iconBg: "bg-blue-100 dark:bg-blue-900",
      title: "Telegram",
      description:
        "Diskusikan langsung dengan sesama programmer dan dapatkan bantuan langsung dari para ahli.",
      buttonText: "Join Grub",
      buttonLink: "/telegram",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="komunitas"
      className="w-full py-20 md:py-32 bg-muted relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:14px_14px]" />
      </div>

      <div className="container px-4 md:px-6" ref={ref}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl">
              Komunitas{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-red-400">
                Kami
              </span>
            </h2>
            <p className="max-w-[800px] mx-auto text-muted-foreground md:text-lg">
              Kami Juga aktif di Sosial Media
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {communities.map((community, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-xl border bg-background p-6 transition-all hover:shadow-xl"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${community.iconBg}`}
                >
                  {community.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{community.title}</h3>
                <p className="mb-6 text-muted-foreground">
                  {community.description}
                </p>
                <Link href={community.buttonLink} target="_blank">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-red-400 group-hover:text-primary-foreground transition-colors duration-300"
                  >
                    {community.buttonText}
                  </Button>
                </Link>
              </div>

              <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
