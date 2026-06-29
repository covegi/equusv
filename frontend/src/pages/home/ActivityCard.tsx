import { Link } from 'react-router-dom'
import styles from './ActivityCard.module.css'
import type { Activity } from '../../types/activity'
import { AiFillCheckCircle } from "react-icons/ai"

export default function ActivityCard({ activity }: { activity: Activity }) {
    return (
            <Link
                to={activity.active ? `/${activity.url}`: '#'}
                className={styles.card}
                onClick={event => !activity.active && event.preventDefault()}
            >
               {!activity.active && (
                <div className={styles.overlay}>
                    <span className={styles.overlayText}>Kommer snart</span>
                </div>
               )}
               <div className={styles.cardHeader}>
                <span className={styles.categoryLabel}>{activity.category}</span>
                {activity.mandatory && <span className={styles.mandatory}>Lagstadgat</span>}
               </div>
               <h3 className={styles.title}>{activity.name}</h3>
               <p className={styles.description}>{activity.description}</p>

               <div className={styles.divider} />

               <div className={styles.fields}>
                    {activity.fields.map(field => (
                        <span key={field} className={styles.fieldTag}>{field}</span>
                    ))}
               </div>

               <div className={styles.related}>
                    <span className={styles.relatedLabel}>Relaterade:</span>
                    <div className={styles.relatedValues}>
                        {activity.related?.map(a => (
                            <span key={a} className={styles.relatedValue}>{a}</span>
                        ))}
                    </div>
               </div>

               <div className={styles.divider} />
                    <div className={styles.rolesContainer}>
                            <div className={styles.roleRow}>
                                <span className={styles.roleLabel}>Skapas av:</span>
                                {activity.creator?.map(c => (
                                    <span key={c} className={styles.roleValue}>{c}</span>
                                ))}
                            </div>
                            <div className={styles.roleRow}>
                                <span className={styles.roleLabel}>Verifieras av:</span>
                                <span className={styles.roleValue}>
                                    {activity.verifier.name}
                                    {activity.verifier.title && ` · ${activity.verifier.title}`}
                                </span>
                                {activity.verifier.verified
                                    ? <AiFillCheckCircle className={styles.verifiedBadge} />
                                    : <span className={styles.selfDeclaredDot} />
                                } 
                            </div>
                    </div>     
            </Link>
    )
}