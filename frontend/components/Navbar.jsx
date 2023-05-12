"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "../styles";
import { navVariants } from "../utils/motion";

const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className={`${styles.xPaddings} py-8 relative`}
  >
    <div className="absolute w-[50%] inset-0 gradient-01" />
    <div className={`${styles.innerWidth} mx-auto flex justify-between gap-8`}>
      <div className="w-[24px] h-[24px] object-contain" />
      <h2 className="font-extrabold text-[24px] leading-[30.24px] text-white">
        AppName
      </h2>
      <Link href="/product">
        <button
          type="button"
          className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Launch App
        </button>
      </Link>
    </div>
  </motion.nav>
);

export default Navbar;
